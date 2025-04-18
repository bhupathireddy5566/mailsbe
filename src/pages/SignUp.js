import { Link } from "react-router-dom";
import styles from "../styles/pages/SignUp.module.css";
import { useState } from "react";
import { Helmet } from "react-helmet";

const SignUp = ({ nhost }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleSignUp = () => {
    setIsRedirecting(true);
    const currentUrl = window.location.origin;
    nhost.auth.signIn({
      provider: "google",
      redirectTo: `${currentUrl}/app`
    });
  };

  if (isRedirecting) {
    return <div className={styles.verification}>Redirecting to Google...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Sign Up - Mailsbe</title>
      </Helmet>
      <div className={styles.signUpDiv}>
        <div className={styles.formDiv}>
          <div className={styles.titleDiv}>
            <div className={styles.joinUsToday}>Join us today 👋</div>
            <div className={styles.createAnAccountToStartUsi}>
              Create an account to start using mailsbe from today, completely
              free.
            </div>
            <button className={styles.button} onClick={handleGoogleSignUp}>
              <div className={styles.buttonPrimaryWithIconDiv}>
                <div className={styles.frameDiv}>
                  <div className={styles.buttonNameDiv}>
                    {" "}
                    Sign up with Google
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
                src="../google-21.svg"
              />
            </button>
          </div>
          
          <div className={styles.alreadyHaveAnAccountSign}>
            <span className={styles.alreadyHaveAnContainer}>
              <span
                className={styles.alreadyHaveAn}
              >{`Already have an account? `}</span>
              <Link to="/sign-in" className={styles.signInSpan}>
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
