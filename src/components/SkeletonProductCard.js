import React from "react";

function SkeletonProductCard() {
  return (
    <div className="card border-0 shadow-sm p-2 h-100 placeholder-glow">
      <div
        className="placeholder rounded mb-2 w-100"
        style={{ height: "180px" }}
      ></div>

      <div className="card-body p-1 text-center">
        <div className="placeholder col-8 mx-auto mb-2"></div>

        <div className="placeholder col-6 mx-auto mb-2"></div>

        <p className="placeholder col-4 mx-auto mb-3"></p>

        <button
          className="btn btn-dark btn-sm w-100 disabled placeholder col-12"
          disabled
        ></button>
      </div>
    </div>
  );
}

export default SkeletonProductCard;