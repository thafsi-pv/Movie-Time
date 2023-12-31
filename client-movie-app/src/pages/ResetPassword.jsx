import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Layout1 from "../components/Layout1";
import Label from "../components/Label";
import Button from "../components/Button";
import Input from "../components/Input";
import axios from "axios";
import { USER_API } from "../constants/const";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import useLoader from "../hooks/useLoader";

const ResetPassword = () => {
  //const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();
  const [passwordReset, setPasswordReset] = useState({
    resetCode: "",
    newPassword: "",
  });
  const [matchPassword, setMatchPassword] = useState(true);
  const { showLoader, setShowLoader } = useLoader();

  const handleInputChange = (e) => {
    setPasswordReset((prev) => ({
      ...passwordReset,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitBtn = async () => {
    try {
      if (passwordReset.newPassword && matchPassword) {
        setShowLoader(true);
        const response = await axios(`${USER_API}resetPassword`, {
          method: "POST",
          data: {
            passwordReset,
          },
        });
        if (response.status == 200) {
          setShowLoader(false);
          toast.success("Password reset succeeded 👍🏻");
          navigate("/signIn");
        }
      }
    } catch (error) {
      console.log("🚀 ~ file: ResetPassword.jsx:47 ~ handleSubmitBtn ~ error:", error)
      toast.error(error.response.data.message);
    } finally {
      setShowLoader(false);
    }
  };

  const reenterPassword = (e) => {
    const data = e.target.value;
    if (passwordReset.newPassword != data) {
      setMatchPassword(false);
    } else {
      setMatchPassword(true);
    }
  };

  return (
    <Layout1 headingLabel="Reset Password">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="" action="#" method="POST" autoComplete="off">
          <div className="pb-4">
            <Label htmlFor="email" labelText="Reset Code" />
            <Input
              id="resetCode"
              name="resetCode"
              state={passwordReset.resetCode}
              handleChange={handleInputChange}
              type="number"
            />
          </div>
          <div className="pb-2">
            <Label htmlFor="email" labelText="New Password" />
            <Input
              id="newPassword"
              name="newPassword"
              state={passwordReset.newPassword}
              handleChange={handleInputChange}
              type="password"
            />
          </div>
          <div className="pb-6">
            <Label htmlFor="email" labelText="Reenter password" />
            <input
              type="password"
              onChange={(e) => reenterPassword(e)}
              className="block w-full rounded-md border-0 px-1 py-1.5 bg-white text-gray-700 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400  sm:text-sm sm:leading-6"
            />
            {!matchPassword && (
              <span className="text-red-500 text-xs">
                Not match with new password
              </span>
            )}
          </div>

          <div>
            <Button
              type="button"
              btnLable="Reset Password"
              onClick={handleSubmitBtn}
            />
          </div>
        </form>
      </div>
      <div>
        {showLoader && <Loader />}
      </div>
    </Layout1>
  );
};

export default ResetPassword;
