// ** React Imports
import { useState, Fragment, useEffect } from "react";

// ** Reactstrap Imports
import {
  Row,
  Col,
  Card,
  Form,
  CardBody,
  Button,
  Badge,
  Modal,
  Input,
  Label,
  ModalBody,
  ModalHeader,
} from "reactstrap";

// ** Third Party Components
import Swal from "sweetalert2";
import Select from "react-select";
import { Check, Briefcase, X } from "react-feather";
import { useForm, Controller } from "react-hook-form";
import withReactContent from "sweetalert2-react-content";

// ** Custom Components
import Avatar from "@components/avatar";

// ** Utils
import { selectThemeColors } from "@utils";

// ** Styles
import "@styles/react/libs/react-select/_react-select.scss";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const roleColors = {
  editor: "light-info",
  admin: "light-danger",
  author: "light-warning",
  maintainer: "light-success",
  subscriber: "light-primary",
};

const statusColors = {
  active: "light-success",
  pending: "light-warning",
  inactive: "light-secondary",
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const countryOptions = [
  { value: "uk", label: "UK" },
  { value: "usa", label: "USA" },
  { value: "france", label: "France" },
  { value: "russia", label: "Russia" },
  { value: "canada", label: "Canada" },
];

const languageOptions = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "dutch", label: "Dutch" },
];

const MySwal = withReactContent(Swal);

const UserInfoCard = ({ selectedUser, onUserUpdated }) => {
   const userdata = useSelector((state) => state.auth.userData);
  const [users, setUsers] = useState([]);
const flattenTeam = (team = []) => {
  let flat = [];
  for (const member of team) {
    flat.push(member);
    if (member.subordinates && member.subordinates.length > 0) {
      flat = flat.concat(flattenTeam(member.subordinates));
    }
  }
  return flat;
};
  useEffect(() => {
    if (userdata?.team) {
      const teamList = flattenTeam(userdata.team);
      setUsers(teamList);
    }
  }, [userdata]);
  // ** State
  const [show, setShow] = useState(false);
  const { tabtype } = useParams();
  const token = useSelector((state) => state.auth.accessToken);
  // ** Hook
  console.log("tabtype ", tabtype);
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [designations, setDesignations] = useState([]);
  console.log("tokentoken", token);
  useEffect(() => {
    console.log("enter");
    if (open && tabtype !== "designation") {
      axios
        .get("https://lspschoolerp.pythonanywhere.com/erp-api/designation/", {
          headers: {
            Authorization: `Token ${token}`, // add token here
          },
        }) // replace with your API
        .then((res) => {
          console.log("res", res);
          setDesignations(res.data);
          // assuming API returns [{id:1, name:"Admin"}, ...]
        })
        .catch((err) => console.log(err));
    }
  }, []);

  useEffect(() => {
    if (designations.length > 0 && tabtype !== "designation") {
      setRole(designations[0].id); // default select first designation
    }
  }, []);

  const defaultValues =
    tabtype === "designation"
      ? { name: selectedUser?.name || "" }
      : tabtype === "task"
      ? {
          title: selectedUser?.title || "",
          description: selectedUser?.description || "",
          assigned_to: selectedUser?.assigned_to?.id || "",
          status: selectedUser?.status || "pending",
          priority: selectedUser?.priority || "medium",
          due_date: selectedUser?.due_date || "", 
        }
      : {
          firstName: selectedUser?.first_name || "",
          lastName: selectedUser?.last_name || "",
          email: selectedUser?.email || "",
          designation: selectedUser?.designation?.id || "",
        };
  const {
    reset,
    control,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  // ** render user img
  const renderUserImg = () => {
    if (selectedUser !== null && selectedUser.avatar?.length) {
      return (
        <img
          height="110"
          width="110"
          alt="user-avatar"
          src={selectedUser.avatar}
          className="img-fluid rounded mt-3 mb-2"
        />
      );
    } else {
      return (
        <Avatar
          initials
          color={selectedUser.avatarColor || "light-primary"}
          className="rounded mt-3 mb-2"
          content={selectedUser.first_name}
          contentStyles={{
            borderRadius: 0,
            fontSize: "calc(48px)",
            width: "100%",
            height: "100%",
          }}
          style={{
            height: "110px",
            width: "110px",
          }}
        />
      );
    }
  };

  const onSubmit = async (data) => {
    try {
      const { id } = selectedUser || {};
      const isEdit = Boolean(id);

      let url = "";
      let body = {};
      let method = isEdit ? "PUT" : "POST";

      if (tabtype === "designation") {
        url = `https://lspschoolerp.pythonanywhere.com/erp-api/designation/${
          isEdit ? `${id}/` : ""
        }`;
        body = { name: data.name };
      } else if (tabtype === "task") {
        url = `https://lspschoolerp.pythonanywhere.com/erp-api/task/${
          isEdit ? `${id}/` : ""
        }`;
        body = {
          title: data.title,
          description: data.description,
          assigned_to: Number(data.assigned_to),
          status: data.status,
          priority: data.priority,
          due_date: data.due_date,
          assigned_by: data.id,
        };
      } else {
        url = `https://lspschoolerp.pythonanywhere.com/erp-api/user/${
          isEdit ? `${id}/` : ""
        }`;
        body = {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          designation: Number(data.designation),
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const updatedData = await response.json();
        MySwal.fire({
          icon: "success",
          title: "Success!",
          text: `${
            tabtype.charAt(0).toUpperCase() + tabtype.slice(1)
          } updated successfully.`,
        });
        if (onUserUpdated) onUserUpdated(updatedData);
        setShow(false);
      } else {
        const errorData = await response.json();
        MySwal.fire({
          icon: "error",
          title: "Failed",
          text: errorData.detail || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error(error);
      MySwal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please try again later.",
      });
    }
  };

  const handleDelete = () => {
    const entity = tabtype; // 'designation' | 'user' | 'task'
    const entityName = entity.charAt(0).toUpperCase() + entity.slice(1); // For popup titles

    MySwal.fire({
      title: `Delete ${entityName}?`,
      text: `Are you sure you want to delete this ${entityName.toLowerCase()}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, delete it!`,
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-outline-secondary ms-1",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `https://lspschoolerp.pythonanywhere.com/erp-api/${entity}/${selectedUser.id}/`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );

          if (response.ok) {
            MySwal.fire({
              icon: "success",
              title: `${entityName} Deleted!`,
              text: `${entityName} has been successfully deleted.`,
              customClass: { confirmButton: "btn btn-success" },
            }).then(() => {
              // ✅ Navigate back to correct list view after deletion
              navigate(`/apps/${entity}/list`);
            });
          } else {
            const errorData = await response.json();
            MySwal.fire({
              icon: "error",
              title: "Delete Failed",
              text:
                errorData.detail ||
                `Error deleting ${entityName.toLowerCase()}`,
            });
          }
        } catch (error) {
          console.error(error);
          MySwal.fire({
            icon: "error",
            title: "Network Error",
            text: "Something went wrong. Please try again later.",
          });
        }
      }
    });
  };

  const handleReset = () => {
    reset({
      username: selectedUser.first_name,
      lastName: selectedUser.last_name,
      firstName: selectedUser.first_name,
    });
  };

  const handleSuspendedClick = () => {
    return MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Suspend user!",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-outline-danger ms-1",
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        MySwal.fire({
          icon: "success",
          title: "Suspended!",
          text: "User has been suspended.",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      } else if (result.dismiss === MySwal.DismissReason.cancel) {
        MySwal.fire({
          title: "Cancelled",
          text: "Cancelled Suspension :)",
          icon: "error",
          customClass: {
            confirmButton: "btn btn-success",
          },
        });
      }
    });
  };

  return (
    <Fragment>
      <Card>
        <CardBody>
          <div className="user-avatar-section">
            <div className="d-flex align-items-center flex-column">
              {renderUserImg()}
              <div className="d-flex flex-column align-items-center text-center">
                <div className="user-info">
                  <h4>
                    {selectedUser !== null
                      ? selectedUser.fullName
                      : "Eleanor Aguilar"}
                  </h4>
                  {selectedUser !== null ? (
                    <Badge
                      color={roleColors[selectedUser.role]}
                      className="text-capitalize"
                    >
                      {selectedUser.role}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-around my-2 pt-75">
            <div className="d-flex align-items-start me-2">
              <Badge color="light-primary" className="rounded p-75">
                <Check className="font-medium-2" />
              </Badge>
              <div className="ms-75">
                <h4 className="mb-0">1.23k</h4>
                <small>Tasks Done</small>
              </div>
            </div>
            <div className="d-flex align-items-start">
              <Badge color="light-primary" className="rounded p-75">
                <Briefcase className="font-medium-2" />
              </Badge>
              <div className="ms-75">
                <h4 className="mb-0">568</h4>
                <small>Projects Done</small>
              </div>
            </div>
          </div>
          <h4 className="fw-bolder border-bottom pb-50 mb-1">Details</h4>
          <div className="info-container">
            {selectedUser !== null ? (
              <ul className="list-unstyled">
                {tabtype === "designation" && (
                  // Show designation details
                  <li className="mb-75">
                    <span className="fw-bolder me-25">Designation Name :</span>
                    <span>{selectedUser.name}</span>
                  </li>
                )}{" "}
                {tabtype === "user" && (
                  <>
                    <li className="mb-75">
                      <span className="fw-bolder me-25">First Name :</span>
                      <span>{selectedUser.first_name}</span>
                    </li>
                    <li className="mb-75">
                      <span className="fw-bolder me-25">Last Name :</span>
                      {selectedUser.last_name}
                    </li>
                    <li className="mb-75">
                      <span className="fw-bolder me-25">Email:</span>
                      <span>{selectedUser.email}</span>
                    </li>

                    <li className="mb-75">
                      <span className="fw-bolder me-25">Designation:</span>
                      <span className="text-capitalize">
                        {selectedUser?.designation?.name}
                      </span>
                    </li>
                  </>
                )}
                {tabtype === "task" && (
                  <>
                    <li>
                      <span className="fw-bolder me-25">Title:</span>
                      {selectedUser?.title}
                    </li>
                    <li>
                      <span className="fw-bolder me-25">Description:</span>
                      <span
                        style={{
                          display: "inline-block", // ✅ required for ellipsis
                          maxWidth: "320px", // ✅ adjust as needed
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          verticalAlign: "bottom",
                          cursor: "pointer",
                        }}
                        title={selectedUser?.description} // ✅ shows full text on hover
                      >
                        {selectedUser?.description}
                      </span>
                    </li>

                    <li>
                      <span className="fw-bolder me-25">Status:</span>
                      {selectedUser?.status}
                    </li>
                    <li>
                      <span className="fw-bolder me-25">Priority:</span>
                      {selectedUser?.priority}
                    </li>
                    <li>
                      <span className="fw-bolder me-25">Due Date:</span>
                      {selectedUser?.due_date}
                    </li>

                    <li>
                      <span className="fw-bolder me-25">Assign To:</span>
                      {selectedUser?.assigned_to.name}
                    </li>
                  </>
                )}
                {/* <li className='mb-75'>
                  <span className='fw-bolder me-25'>Tax ID:</span>
                  <span>Tax-{selectedUser.contact.substr(selectedUser.contact.length - 4)}</span>
                </li> */}
              </ul>
            ) : null}
          </div>
          <div className="d-flex justify-content-center pt-2">
            <Button color="primary" onClick={() => setShow(true)}>
              Edit
            </Button>
            {(tabtype === "designation" || tabtype === "task") && (
              <Button
                className="ms-1"
                color="danger"
                outline
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
      <Modal
        isOpen={show}
        toggle={() => setShow(!show)}
        className="modal-dialog-centered modal-lg"
      >
        <ModalHeader
          className="bg-transparent"
          toggle={() => setShow(!show)}
        ></ModalHeader>
        <ModalBody className="px-sm-5 pt-50 pb-5">
          <div className="text-center mb-2">
            <h1 className="mb-1">Edit User Information</h1>
            <p>Updating user details will receive a privacy audit.</p>
          </div>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="gy-1 pt-75">
              {tabtype === "designation" && (
                <Col md={12}>
                  <Label className="form-label" for="name">
                    Designation Name
                  </Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder="Designation Name"
                        invalid={errors.name && true}
                      />
                    )}
                  />
                </Col>
              )}{" "}
              {tabtype === "user" && (
                <>
                  <Col md={6} xs={12}>
                    <Label className="form-label" for="firstName">
                      First Name
                    </Label>
                    <Controller
                      defaultValue=""
                      control={control}
                      id="firstName"
                      name="firstName"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="firstName"
                          placeholder="John"
                          invalid={errors.firstName && true}
                        />
                      )}
                    />
                  </Col>
                  <Col md={6} xs={12}>
                    <Label className="form-label" for="lastName">
                      Last Name
                    </Label>
                    <Controller
                      defaultValue=""
                      control={control}
                      id="lastName"
                      name="lastName"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="lastName"
                          placeholder="Doe"
                          invalid={errors.lastName && true}
                        />
                      )}
                    />
                  </Col>

                  <Col md={6} xs={12}>
                    <Label className="form-label" for="billing-email">
                      Email
                    </Label>
                    <Controller
                      control={control}
                      name="email"
                      defaultValue={selectedUser.email || ""}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          id="email"
                          placeholder="example@domain.com"
                          invalid={errors.email && true}
                        />
                      )}
                    />
                  </Col>
                  <Col md={6} xs={12}>
                    <Label className="form-label" for="designation">
                      Designation
                    </Label>
                    <Controller
                      name="designation"
                      control={control}
                      defaultValue={selectedUser.designation?.id || ""} // use ID
                      render={({ field }) => (
                        <Input
                          type="select"
                          id="designation"
                          {...field}
                          invalid={errors.designation && true}
                        >
                          <option value="">Select Designation</option>
                          {designations?.map((d) => (
                            <option key={d.id} value={Number(d.id)}>
                              {d.name}
                            </option>
                          ))}
                        </Input>
                      )}
                    />
                  </Col>

                  {/* <Col md={6} xs={12}>
                <Label className='form-label' for='status'>
                  Status:
                </Label>
                <Select
                  id='status'
                  isClearable={false}
                  className='react-select'
                  classNamePrefix='select'
                  options={statusOptions}
                  theme={selectThemeColors}
                  defaultValue={statusOptions[statusOptions.findIndex(i => i.value === selectedUser.status)]}
                />
              </Col> */}
                  {/* <Col md={6} xs={12}>
                <Label className='form-label' for='tax-id'>
                  Tax ID
                </Label>
                <Input
                  id='tax-id'
                  placeholder='Tax-1234'
                  defaultValue={selectedUser?.contact?.substr(selectedUser.contact.length - 4)}
                />
              </Col>
              <Col md={6} xs={12}>
                <Label className='form-label' for='contact'>
                  Contact
                </Label>
                <Input id='contact' defaultValue={selectedUser.contact} placeholder='+1 609 933 4422' />
              </Col>
              <Col md={6} xs={12}>
                <Label className='form-label' for='language'>
                  language
                </Label>
                <Select
                  id='language'
                  isClearable={false}
                  className='react-select'
                  classNamePrefix='select'
                  options={languageOptions}
                  theme={selectThemeColors}
                  defaultValue={languageOptions[0]}
                />
              </Col> */}
                  {/* <Col md={6} xs={12}>
                <Label className='form-label' for='country'>
                  Country
                </Label>
                <Select
                  id='country'
                  isClearable={false}
                  className='react-select'
                  classNamePrefix='select'
                  options={countryOptions}
                  theme={selectThemeColors}
                  defaultValue={countryOptions[0]}
                />
              </Col>
              <Col xs={12}>
                <div className='d-flex align-items-center mt-1'>
                  <div className='form-switch'>
                    <Input type='switch' defaultChecked id='billing-switch' name='billing-switch' />
                    <Label className='form-check-label' htmlFor='billing-switch'>
                      <span className='switch-icon-left'>
                        <Check size={14} />
                      </span>
                      <span className='switch-icon-right'>
                        <X size={14} />
                      </span>
                    </Label>
                  </div>
                  <Label className='form-check-label fw-bolder' for='billing-switch'>
                    Use as a billing address?
                  </Label>
                </div>
              </Col> */}
                </>
              )}
              {tabtype === "task" && (
                <>
                  <Col md={6}>
                    <Label for="title">Task Title</Label>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter title"
                          invalid={errors.title && true}
                        />
                      )}
                    />
                  </Col>
                  {/* <Col md={6}>
                    <Label for="assigned_to">Assign To</Label>
                    <Controller name="assigned_to" control={control}
                      render={({ field }) => (
                        <Input type="select" {...field}>
                          <option value="">Select User</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.email}</option>
                          ))}
                        </Input>
                      )}
                    />
                  </Col> */}
                  <Col md={12}>
                    <Label for="description">Description</Label>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          style={{
                            maxHeight: "100px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                          }}
                          title={field.value}
                          type="textarea"
                          placeholder="Task description"
                        />
                      )}
                    />
                  </Col>
                  <Col md={6}>
                    <Label for="status">Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Input type="select" {...field}>
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Input>
                      )}
                    />
                  </Col>
                  <Col md={6}>
                    <Label for="assigned_to">Assign To</Label>
                    <Controller
                      name="assigned_to"
                      control={control}
                      render={({ field }) => (
                        <Input type="select" {...field}>
                          <option value="">Select User</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.email || u.name}
                            </option>
                          ))}
                        </Input>
                      )}
                    />
                  </Col>

                  {/* Priority */}
                  <Col md={4}>
                    <Label for="priority">Priority</Label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Input type="select" {...field}>
                          <option value="">Select Priority</option>
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </Input>
                      )}
                    />
                  </Col>

                  {/* Due Date */}
                  <Col md={4}>
                    <Label for="due_date">Due Date</Label>
                    <Controller
                      name="due_date"
                      control={control}
                      render={({ field }) => <Input type="date" {...field} />}
                    />
                  </Col>
                </>
              )}
              <Col xs={12} className="text-center mt-2 pt-50">
                <Button type="submit" className="me-1" color="primary">
                  Submit
                </Button>
                <Button
                  type="reset"
                  color="secondary"
                  outline
                  onClick={() => {
                    handleReset();
                    setShow(false);
                  }}
                >
                  Discard
                </Button>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default UserInfoCard;
