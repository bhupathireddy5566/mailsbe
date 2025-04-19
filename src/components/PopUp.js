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

// The absolute simplest mutation possible
const MINIMAL_MUTATION = gql`
  mutation InsertMinimal($email: String!, $description: String!, $img_text: String!) {
    insert_emails_one(object: {
      email: $email, 
      description: $description, 
      img_text: $img_text
    }) {
      id
    }
  }
`;

const PopUp = ({ setPopUp }) => {
  // Get the user data
  const user = useUserData();

  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState(user?.displayName || "");
  const [imgText, setImgText] = useState("");

  const [addEmail, { loading, error }] = useMutation(MINIMAL_MUTATION);

  const ref = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Submitting with minimal mutation");
      
      if (!imgText) {
        toast.error("Tracking ID not generated. Please try again.");
        return;
      }
      
      // Extract the tracking ID
      const trackingId = imgText.includes("=") ? imgText.split("=")[1] : "";
      
      console.log("Sending data:", {
        email: email,
        description: description,
        img_text: trackingId
      });
      
      // Use the minimal mutation with exact field names
      const result = await addEmail({
        variables: {
          email: email,
          description: description,
          img_text: trackingId // Use exact field name from schema
        }
      });
      
      console.log("Mutation result:", result);
      toast.success("Email added successfully");
      setPopUp(false);
      window.location.reload();
    } catch (err) {
      console.error("Error adding email:", err);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      
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
