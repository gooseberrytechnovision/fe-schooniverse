import React, { useEffect, useState } from "react";
import "./ChildrenDetails.css"; // Import styles
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "../../../actions/auth";
import boy from "../../../images/boy.svg";
import girl from "../../../images/girl.svg";

const ChildrenDetails = () => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch, user.students?.length]);

  const childrenData = user.studentData;

  const [selectedChild, setSelectedChild] = useState(childrenData[0]);

  return (
    <div className="container text-center mt-4 pb-4">
      {/* Child Icons */}
      <div className="row gap-4 justify-content-center">
        {childrenData.map((child) => {
          const gender = child?.gender?.toLowerCase() || "";
          const isSelected = selectedChild?.id === child?.id;

          return (
            <div key={child?.id} className="col-auto text-center">
              <div
                className={`child-circle mx-auto ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => setSelectedChild(child)}
              >
                {/* Boy/Girl Icon */}
                {gender === "male" ? (
                  <img src={boy} width={200} alt="boy_img" />
                ) : gender === "female" ? (
                  <img src={girl} width={200} alt="girl_img" />
                ) : null}
              </div>
              <p className={`child-name ${isSelected ? "selected-text" : ""}`}>
                {child?.studentName}
              </p>
            </div>
          );
        })}
      </div>

      {/* Child Details Table */}
      <div className="row">
        {/* <div className="col-md-12">
          <div className="fs-3 mb-3 text-primary text-sm-start">
            Children Details:
          </div>
        </div> */}
        <div className="col-md-12 ">
          <span className="float-sm-start">
            USID: <strong>{selectedChild.usid}</strong>
          </span>
        </div>
      </div>
      <div className="card my-3 p-3 shadow-sm">
        <table className="table table-bordered mt-2">
          <tbody className="text-sm-start">
            <tr>
              <td className="w-25">
                <i className="bi bi-person"></i> <strong>Full Name:</strong>
              </td>
              <td>{selectedChild.studentName}</td>
            </tr>
            <tr>
              <td className="w-25">
                <i className="bi bi-mortarboard"></i> <strong>Grade:</strong>
              </td>
              <td>{selectedChild.class}</td>
            </tr>
            <tr>
              <td className="w-25">
                <i className="bi bi-book"></i> <strong>Section:</strong>
              </td>
              <td>{selectedChild.section}</td>
            </tr>
            <tr>
              <td className="w-25">
                <i className="bi bi-house"></i> <strong>House Name:</strong>
              </td>
              <td>{selectedChild.house}</td>
            </tr>
            <tr>
              <td className="w-25">
                <i className="bi bi-house"></i> <strong>Address:</strong>
              </td>
              <td>{selectedChild.address}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChildrenDetails;
