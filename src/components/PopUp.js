import {
  TextField,
  Typography,
  IconButton,
  FormHelperText,
  FormControl,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import toast from "react-hot-toast";
import { useUserData } from "@nhost/react";

import styles from "../styles/components/Popup.module.css";
import { useState, useEffect, useRef } from "react";
import { gql, useMutation } from "@apollo/client";

// Function to ensure we have a valid UUID
const ensureValidUUID = (id) => {
  // UUID v4 format regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!id) return null;
  
  // If the ID is already a valid UUID, return it
  if (uuidRegex.test(id)) {
    return id;
  }
  
  // If the ID is a string but not in UUID format, transform it
  if (typeof id === 'string') {
    // Use the string to create a deterministic UUID-like string
    // This is a simple implementation and not cryptographically secure
    let uuid = '00000000-0000-0000-0000-000000000000';
    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
    
    if (cleanId.length >= 32) {
      // If we have enough characters, format them as a UUID
      uuid = `${cleanId.substring(0, 8)}-${cleanId.substring(8, 12)}-${cleanId.substring(12, 16)}-${cleanId.substring(16, 20)}-${cleanId.substring(20, 32)}`;
    }
    
    return uuid;
  }
  
  // Default to null if we can't create a valid UUID
  return null;
};

const ADD_EMAIL = gql`
  mutation addEmail(
    $email: String
    $description: String
    $img_text: String
    $user: String
  ) {
    insert_emails(
      objects: {
        description: $description
        email: $email
        img_text: $img_text
        user: $user
      }
    ) {
      affected_rows
    }
  }
`;

// Try a different approach with a direct mutation
const ADD_EMAIL_DIRECT = gql`
  mutation AddEmailDirect($email: String!, $description: String!, $img_text: String!, $user: uuid!) {
    insert_emails_one(object: {email: $email, description: $description, img_text: $img_text, user: $user}) {
      id
    }
  }
`;

// Try a simplified mutation that should match the exact Hasura schema
const SIMPLE_ADD_EMAIL = gql`
  mutation SimpleAddEmail($email: String!, $description: String!, $img_text: String!) {
    insert_emails_one(object: {email: $email, description: $description, img_text: $img_text}) {
      id
    }
  }
`;

const PopUp = ({ setPopUp }) => {
  //get the user data
  const user = useUserData();

  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState(user?.displayName || "");
  const [imgText, setImgText] = useState("");

  const [addEmail, { data, loading, error }] = useMutation(ADD_EMAIL);

  const ref = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("User ID:", user?.id);
      await addEmail({
        variables: {
          email: email,
          description: description,
          img_text: imgText.split("=")[1],
          user: user?.id,
        },
      });
      toast.success("Email added successfully");
      setPopUp(false);
      window.location.reload();
    } catch (err) {
      console.error("Error adding email:", err);
      
      // Log detailed GraphQL errors if available
      if (err.graphQLErrors) {
        console.error("GraphQL Errors:", err.graphQLErrors);
      }
      
      // Log network errors if available
      if (err.networkError) {
        console.error("Network Error:", err.networkError);
      }
      
      toast.error("Unable to add email: " + (err.message || "Unknown error"));
    }
  };

  useEffect(() => {
    const time = new Date().getTime();
    setImgText(
      `https://tkjfsvqlulofoefmacvj.nhost.run/v1/functions/update?text=${time}`
    );
  }, []);

  return (
    <div className={styles.popup}>
      <div className={styles.popUpDiv}>
        <div className={styles.header}>
          <Typography variant="h6" component="h4">
            Enter new email details
          </Typography>

          <IconButton aria-label="close" onClick={() => setPopUp(false)}>
            <HighlightOffIcon />
          </IconButton>
        </div>
        <form className={styles.groupForm} onSubmit={handleSubmit}>
          <FormControl sx={{ m: 0, width: "100%" }} error={error}>
            <TextField
              className={styles.inputOutlinedTextField}
              fullWidth
              color="primary"
              variant="outlined"
              type="email"
              label="Email"
              placeholder="Receiver's email"
              size="medium"
              margin="none"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              className={styles.textAreaOutlinedTextField}
              color="primary"
              variant="outlined"
              multiline
              label="Description"
              placeholder="Some distinct description"
              helperText="This text will help to seperate emails."
              required
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <TextField
              color="primary"
              variant="outlined"
              label="Your Name"
              placeholder="Enter your full name"
              helperText="An image will be attached with this text."
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className={styles.copyBox}>
              <div className={styles.imgDiv} ref={ref}>
                {name && name.substring(0, 1)}
                <img
                  src={imgText}
                  className={styles.pixelImg}
                  width={1}
                  height={1}
                  alt="Tracking pixel"
                />
                {name && name.substring(1, name.length)}
              </div>
              <span className={styles.imgHelperText}>
                Copy this text and paste it in the email.{" "}
                <strong>Imp: Don't erase it after pasting.</strong>
              </span>
            </div>

            {error && (
              <FormHelperText>{`Error occured! ${error.message}`}</FormHelperText>
            )}

            <LoadingButton
              className={styles.buttonContainedText}
              variant="contained"
              color="primary"
              endIcon={<SaveIcon />}
              size="large"
              fullWidth
              type="submit"
              loading={loading}
            >
              Save
            </LoadingButton>
          </FormControl>
        </form>
      </div>
    </div>
  );
};

export default PopUp;
