import { NhostClient } from "@nhost/nhost-js";

const backendUrl = process.env.NHOST_BACKEND_URL;
const adminSecret = process.env.NHOST_ADMIN_SECRET;

// Log critical configuration for debugging
console.log("Function configuration:");
console.log("Backend URL configured:", !!backendUrl);
console.log("Admin secret configured:", !!adminSecret);

const nhost = new NhostClient({
  backendUrl: backendUrl,
});

export default async (req, res) => {
  const imgText = req.query.text;
  console.log("📨 Tracking pixel requested for img_text:", imgText);

  // Always send a transparent pixel GIF regardless of errors
  // to avoid broken images in emails
  const sendTransparentPixel = () => {
    res.writeHead(200, {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });
    const transparentGif = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    res.end(transparentGif);
  };

  if (!imgText) {
    console.error("No image token provided in request");
    sendTransparentPixel();
    return;
  }

  if (!adminSecret) {
    console.error("Admin secret is not configured!");
    sendTransparentPixel();
    return;
  }

  // GraphQL query to get email by img_text
  const GET_EMAIL = `
    query getEmail($imgText: String!) {
      emails(where: {img_text: {_eq: $imgText}}) {
        id
        seen
      }
    }
  `;

  // Mutation to update seen status
  const UPDATE_EMAIL = `
    mutation updateEmailSeen($id: Int!, $date: timestamptz!) {
      update_emails(
        where: {id: {_eq: $id}}, 
        _set: {seen: true, seen_at: $date}
      ) {
        affected_rows
      }
    }
  `;

  try {
    // Step 1: Query to get email ID using img_text
    console.log(`Making GraphQL request to ${backendUrl}/v1/graphql`);
    const getResponse = await fetch(`${backendUrl}/v1/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": adminSecret,
      },
      body: JSON.stringify({
        query: GET_EMAIL,
        variables: { imgText },
      }),
    });

    const getResult = await getResponse.json();
    console.log("Query response:", JSON.stringify(getResult));

    if (getResult.errors) {
      console.error("GraphQL errors:", getResult.errors);
      sendTransparentPixel();
      return;
    }

    if (!getResult.data || !getResult.data.emails || !getResult.data.emails.length) {
      console.error("Email not found with img_text:", imgText);
      sendTransparentPixel();
      return;
    }

    const email = getResult.data.emails[0];
    console.log("📧 Found email:", email);

    if (email.seen) {
      console.log("✅ Email already marked as seen");
      sendTransparentPixel();
      return;
    }

    const emailId = email.id;
    const now = new Date().toISOString();

    // Step 2: Mutation to update seen status
    console.log(`Updating email ID ${emailId} as seen at ${now}`);
    const updateResponse = await fetch(`${backendUrl}/v1/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": adminSecret,
      },
      body: JSON.stringify({
        query: UPDATE_EMAIL,
        variables: { id: emailId, date: now },
      }),
    });

    const updateResult = await updateResponse.json();
    console.log("Update response:", JSON.stringify(updateResult));

    if (updateResult.errors) {
      console.error("❌ Error updating email:", updateResult.errors);
      sendTransparentPixel();
      return;
    }

    console.log("✅ Successfully updated email seen status, affected rows:", 
      updateResult.data?.update_emails?.affected_rows || 0);

    // Return transparent pixel
    sendTransparentPixel();
  } catch (error) {
    console.error("🔥 Unexpected error:", error);
    // Always return a valid image even if there's an error
    sendTransparentPixel();
  }
};
