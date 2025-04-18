import { Link } from "react-router-dom";
import styles from "../styles/pages/SignIn.module.css";
import { useState } from "react";
import { Helmet } from "react-helmet";

const SignIn = ({ nhost }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleSignIn = () => {
    setIsRedirecting(true);
    const currentUrl = window.location.origin;
    nhost.auth.signIn({
      provider: "google",
      redirectTo: `${currentUrl}/app`
    });
  };

  if (isRedirecting) {
    return <div className={styles["verification-text"]}>Redirecting to Google...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Sign In - Mailsbe</title>
      </Helmet>
      <div className={styles.signInDiv}>
        <div className={styles.formDiv}>
          <div className={styles.titleDiv}>
            <div className={styles.welcomeBack}>Welcome back 👋</div>
            <div className={styles.fIllInTheRequiredDetailsT}>
              Sign in with your Google account to use mailsbe.
            </div>
            <div className={styles.buttonDiv} onClick={handleGoogleSignIn}>
              <div className={styles.buttonPrimaryWithIconDiv}>
                <div className={styles.frameDiv}>
                  <div className={styles.buttonNameDiv}>
                    Sign in with Google
                  </div>
                  <div className={styles.iconDiv}>
                    <img
                      className={styles.iconOutlinearrowRight}
                      alt=""
                      src="../iconoutlinearrowright.svg"
                    />
                  </div>
                </div>
              </div>
              <img
                className={styles.google2Icon}
                alt=""
                src="../google-2.svg"
              />
            </div>
          </div>
          
          <div className={styles.dontHaveAnAccountCreate}>
            <span className={styles.dontHaveAnContainer}>
              <span
                className={styles.dontHaveAn}
              >{`Don't have an account? `}</span>
              <Link to="/sign-up" className={styles.createFreeAccount}>
                Create free account
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
