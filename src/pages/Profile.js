import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Profile() {

  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    district: "",
    pincode: "",
  });


  const [loading, setLoading] = useState(true);



  useEffect(() => {

    const token = localStorage.getItem("token");


    if (!token) {

      toast.error("Please login to view profile ❌");

      navigate("/login", {
        replace: true,
        state: { from: "/profile" }
      });

      return;

    }



    axios
      .get(
        "https://ecommerce-backend-1-tsra.onrender.com/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      .then((res) => {

        setProfile(res.data);

      })


      .catch((err) => {

        console.error(err);

        toast.error(
          "Failed to load profile ❌"
        );

      })


      .finally(() => {

        setLoading(false);

      });


  }, [navigate]);




  if (loading) {

    return (
      <h3 className="text-center mt-5">
        Loading profile...
      </h3>
    );

  }



  const fullAddress =
    profile.street
      ? `${profile.street},
${profile.city},
${profile.district} - ${profile.pincode}`
      : "Address not added yet";



  const colors = [
    "#ffc107",
    "#0d6efd",
    "#20c997",
    "#dc3545"
  ];


  const bg =
    colors[
      profile.username.length % colors.length
    ];



  return (

    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{
        minHeight:"100vh"
      }}
    >


      <div
        className="card shadow border-0 p-4"
        style={{
          width:"100%",
          maxWidth:"450px",
          borderRadius:"18px"
        }}
      >



        {/* Avatar */}

        <div className="text-center mb-4">

          <div

            className="rounded-circle text-white d-inline-flex align-items-center justify-content-center"

            style={{

              width:"80px",
              height:"80px",
              background:bg,
              fontSize:"28px",
              fontWeight:"bold"

            }}

          >

            {
              profile.username
              ? profile.username.charAt(0).toUpperCase()
              : "U"
            }


          </div>



          <h2 className="mt-3 mb-1 fw-bold">
            My Profile
          </h2>


          <p className="text-muted">
            Manage your account details
          </p>


        </div>
        {/* Username */}

        <div className="mb-3">

          <label className="form-label fw-semibold">
            Username
          </label>


          <input

            className="form-control"

            value={profile.username || ""}

            readOnly

          />

        </div>





        {/* Email */}

        <div className="mb-3">

          <label className="form-label fw-semibold">
            Email
          </label>


          <input

            className="form-control"

            value={profile.email || "Not added"}

            readOnly

          />

        </div>





        {/* Phone */}

        <div className="mb-3">

          <label className="form-label fw-semibold">
            Phone Number
          </label>


          <input

            className="form-control"

            value={profile.phone || "Not available"}

            readOnly

          />

        </div>





        {/* Address */}

        <div className="mb-4">

          <label className="form-label fw-semibold">
            Delivery Address
          </label>


          <textarea

            className="form-control"

            rows="4"

            value={fullAddress}

            readOnly

          />

        </div>





        <button

          className="btn btn-dark w-100"

          onClick={() => navigate("/orders")}

        >

          View My Orders 🛍️

        </button>



      </div>


    </div>

  );

}


export default Profile;