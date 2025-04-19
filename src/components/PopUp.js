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
import { useNhostClient } from '@nhost/react';

import styles from "../styles/components/Popup.module.css";
import { useState, useEffect, useRef } from "react";

const PopUp = ({ setPopUp }) => {
  const user = useUserData();
  const nhost = useNhostClient();

  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState(user?.displayName || "");
  const [imgText, setImgText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ref = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email || !description) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }
      
      if (!imgText) {
        toast.error("Tracking ID not generated. Please try again.");
        setLoading(false);
        return;
      }
      
      // Extract the tracking ID from the URL
      const trackingId = imgText.includes("=") ? imgText.split("=")[1] : "";
      
      console.log("Submitting email with tracking ID:", trackingId);
      
      // Create a direct API request to Hasura
      const response = await fetch(
        `https://${process.env.REACT_APP_NHOST_SUBDOMAIN}.${process.env.REACT_APP_NHOST_REGION}.nhost.run/v1/graphql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': process.env.REACT_APP_HASURA_ADMIN_SECRET,
          },
          body: JSON.stringify({
            query: `
              mutation InsertEmail($email: String!, $description: String!, $img_text: String!) {
                insert_emails_one(object: {
                  email: $email, 
                  description: $description, 
                  img_text: $img_text
                }) {
                  id
                }
              }
            `,
            variables: {
              email: email,
              description: description,
              img_text: trackingId
            }
          })
        }
      );
      
      const result = await response.json();
      console.log("API response:", result);
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      toast.success("Email added successfully");
      setLoading(false);
      setPopUp(false);
      window.location.reload();
    } catch (err) {
      console.error("Error adding email:", err);
      setError(err);
      setLoading(false);
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
