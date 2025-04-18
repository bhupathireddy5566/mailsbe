import { NhostClient } from "@nhost/nhost-js";

const accessToken = process.env.NHOST_ADMIN_SECRET;
const backendUrl = process.env.NHOST_BACKEND_URL;

const nhost = new NhostClient({
  backendUrl: backendUrl,
});

// Set admin access token to allow database operations
nhost.graphql.setAccessToken(accessToken);

export default async (req, res) => {
  // Get the data from the request
  const imgText = req.query.text;
  console.log("imgText", imgText);

  if (!imgText) {
    return res.status(500).json({ error: "No image token provided" });
  }

  // Make a get query to get email id using imgText
  const GET_EMAIL_ID = `
  query getId($text: String!) {
    emails(where: {img_text: {_eq: $text}}) {
      id
      seen
    }
  }`;

  // Update query with the email id
  const UPDATE_QUERY = `
    mutation UpdateEmail($id: Int!, $date: timestamptz!) {
      update_emails(where: {id: {_eq: $id}}, _set: {seen: true, seen_at: $date}) {
        affected_rows
      }
    }`;

  try {
    // First, fetch the email data
    const { data, error } = await nhost.graphql.request(GET_EMAIL_ID, {
      text: imgText,
    });

    console.log("Query result:", data, error);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || !data.emails || data.emails.length === 0) {
      return res.status(500).json({ error: "No email found with this tracking ID" });
    }

    // Extract the email id from the response
    const emailId = data.emails[0].id;
    const seen = data.emails[0].seen;

    if (seen) {
      // Already marked as seen, no need to update
      console.log("Email already marked as seen");
      return res.status(404).send({ error: "Not found" });
    }

    // Update the seen column in emails table
    const { data: updatedData, error: updateError } = 
      await nhost.graphql.request(UPDATE_QUERY, {
        id: emailId,
        date: new Date().toISOString(),
      });

    console.log("Update result:", updatedData, updateError);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Return 404 to not alert email client that this is a tracking pixel
    res.status(404).send({ error: "Not found" });
  } catch (error) {
    console.log("Unexpected error:", error);
    res.status(500).json({ error: error.message || "Unknown error occurred" });
  }
};
