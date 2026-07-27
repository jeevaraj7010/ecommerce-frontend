import React from "react";

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Page navigation" className="d-flex justify-content-center my-4">
      <ul className="pagination pagination-md mb-0 shadow-sm rounded-pill overflow-hidden bg-white border">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link border-0 text-dark"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            &laquo; Prev
          </button>
        </li>

        {pages.map((page) => (
          <li key={page} className="page-item">
            <button
              className={`page-link border-0 ${
                page === currentPage
                  ? "bg-dark text-white fw-bold"
                  : "text-dark"
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link border-0 text-dark"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            Next &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
