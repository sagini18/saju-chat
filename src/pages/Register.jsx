import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const storageRef = ref(storage, displayName);

        uploadBytesResumable(storageRef, file).then(async (error) => {
          getDownloadURL(storageRef).then(async (downloadURL) => {
            await updateProfile(userCredential.user, {
              displayName: displayName,
              photoURL: downloadURL,
            });
            console.log(userCredential.user);
            await setDoc(doc(db, "users", userCredential.user.uid), {
              uid: userCredential.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });
          });
          await setDoc(doc(db, "userChats", userCredential.user.uid), {});
          sendEmailVerification(auth.currentUser)
            .then(() => {
              toast.success("Email Sent for Verification!");
              navigate("/home");
            })
            .catch((error) => {
              toast.error(error.message);
            });
          if (error) {
            toast.error(error.message);
          }
        });
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };
  return (
    <div className="form-container">
      <Toaster toastOptions={{ duration: 4000 }} />
      <div className="form-wrapper">
        <span className="logo">Saju Chat</span>
        <span className="title">Register</span>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label htmlFor="file">
            <i
              className="uil uil-image-plus"
              style={{
                color: "#8da4f1",
                fontSize: "2rem",
                cursor: "pointer",
              }}
            ></i>
            {file === null ? (
              <span>Add an avatar</span>
            ) : (
              <span>{file?.name}</span>
            )}
          </label>
          <button>Sign up</button>
        </form>
        <p>
          Do you have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};
