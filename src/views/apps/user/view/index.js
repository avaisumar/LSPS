// ** React Imports
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// ** Store & Actions
import { useSelector } from "react-redux";
import BasicTimeline from "../../../components/timeline/BasicTimeline";

// ** Reactstrap Imports
import {
  Row,
  Col,
  Alert,
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
} from "reactstrap";

// ** Icons
import { Paperclip, Plus } from "react-feather";

// ** User View Components
import UserTabs from "./Tabs";
import UserInfoCard from "./UserInfoCard";

// ** Styles
import "@styles/react/apps/app-users.scss";

// ** API Imports
import axios from "axios";

const UserView = () => {
  const store = useSelector((state) => state.users.allData);
  const token = useSelector((state) => state.auth.accessToken);
  const loggedInUser = useSelector((state) => state.auth.userData); // ✅ current logged user

  const { id, tabtype } = useParams();
  const [selectedUser, setSelectedUser] = useState(null);

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🟢 Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [desc, setDesc] = useState("");
  const [modalFile, setModalFile] = useState(null);

  // 🟢 Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // ✅ Find selected user from store
  useEffect(() => {
    if (store) {
      const user = store?.find((u) => u.id === parseInt(id));
      setSelectedUser(user);
    }
  }, [store, id]);

  const handleUserUpdated = (updatedUser) => {
    setSelectedUser({ ...selectedUser, ...updatedUser });
  };

  // ✅ Fetch attachments
  useEffect(() => {
    if (!selectedUser?.id) return;
    axios
      .get(
        `https://lspschoolerp.pythonanywhere.com/erp-api/task/${selectedUser.id}/attachments/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      )
      .then((res) => setAttachments(res.data))
      .catch((err) => console.error("Attachment fetch error:", err));
  }, [selectedUser]);

  // ✅ Fetch comments for this task
  useEffect(() => {
    if (!selectedUser?.id) return;
    axios
      .get(
        `https://lspschoolerp.pythonanywhere.com/erp-api/task/${selectedUser.id}/comments/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      )
      .then((res) => setComments(res.data))
      .catch((err) => console.error("Comments fetch error:", err));
  }, [selectedUser]);

  // 🟢 Handle modal file input
  const handleModalFileChange = (e) => setModalFile(e.target.files[0]);

  // 🟢 Add attachment via modal
  const handleSubmitAttachment = async (e) => {
    e.preventDefault();
    if (!taskId || !modalFile) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("task", taskId);
    formData.append("file", modalFile);
    formData.append("description", desc);

    try {
      await axios.post(
        `https://lspschoolerp.pythonanywhere.com/erp-api/task/${taskId}/attachments/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Refresh list
      const res = await axios.get(
        `https://lspschoolerp.pythonanywhere.com/erp-api/task/${selectedUser.id}/attachments/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setAttachments(res.data);
      setModalFile(null);
      setTaskId("");
      setDesc("");
      setModalOpen(false);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return alert("Please write a comment first.");
    setCommentLoading(true);

    try {
      await axios.post(
        `https://lspschoolerp.pythonanywhere.com/erp-api/task/${selectedUser.id}/comments/`,
        {
          task: selectedUser.id, // ✅ send task id
          content: newComment,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      // ✅ Refresh comments
      const res = await axios.get(
        `https://lspschoolerp.pythonanywhere.com/erp-api/task/${selectedUser.id}/comments/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setComments(res.data);
      setNewComment("");
    } catch (err) {
      console.error("Comment post failed:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  const [active, setActive] = useState("2");
  const toggleTab = (tab) => {
    if (active !== tab) setActive(tab);
  };

  return selectedUser ? (
    <div className="app-user-view">
      <Row className="g-6">
        {/* LEFT COLUMN */}
        <Col xl="4" lg="5" xs={{ order: 1 }} md={{ order: 0, size: 5 }}>
          <UserInfoCard
            selectedUser={selectedUser}
            onUserUpdated={handleUserUpdated}
          />

          {/* ✅ Attachments Section */}
          {tabtype === "task" && (
            <>
          <Card className="mt-2">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bolder mb-0">Attachments</h5>
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                >
                  <Plus size={14} className="me-50" /> Add Attachment
                </Button>
              </div>

              <ListGroup flush>
                {attachments.length > 0 ? (
                  attachments.map((att) => (
                    <ListGroupItem key={att.id} className="d-flex flex-column">
                      <a
                        href={
                          att.file.startsWith("http")
                            ? att.file
                            : `https://lspschoolerp.pythonanywhere.com${att.file}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Paperclip size={16} className="me-50" />
                        {att.file.split("/").pop()}
                      </a>
                      <small className="text-muted">
                        Uploaded by: {att.uploaded_by?.name || "Unknown"} on{" "}
                        {new Date(att.uploaded_at).toLocaleString()}
                      </small>
                      {att.description && <small>{att.description}</small>}
                    </ListGroupItem>
                  ))
                ) : (
                  <p className="text-muted mb-0">No attachments yet.</p>
                )}
              </ListGroup>
            </CardBody>
          </Card>

          {/* 💬 Task Comments Section */}
          <Card className="mt-2">
            <CardBody>
              <h5 className="fw-bolder mb-1">Task Comments</h5>

              <div
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  border: "1px solid #eee",
                  borderRadius: "6px",
                  padding: "10px",
                  background: "#fafafa",
                }}
              >
                {comments.length > 0 ? (
                  comments.map((comment) => {
                    const isLoggedInUser =
                      comment.user?.id === loggedInUser?.id; // ✅ check current user

                    return (
                      <div
                        key={comment.id}
                        className={`mb-2 p-2 rounded ${
                          isLoggedInUser
                            ? "bg-light-primary ms-auto text-end"
                            : "bg-light-secondary me-auto text-start"
                        }`}
                        style={{
                          maxWidth: "85%",
                          wordWrap: "break-word",
                        }}
                      >
                        <div className="fw-bold small text-muted">
                          {comment.user?.name || "Unknown"}
                        </div>
                        <div>{comment.content}</div>
                        <small className="text-muted d-block mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </small>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted mb-0">No comments yet.</p>
                )}
              </div>

              <div className="mt-2">
                <Label for="newComment">Add Comment</Label>
                <Input
                  type="textarea"
                  id="newComment"
                  rows="2"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                />
                <Button
                  color="primary"
                  className="mt-1"
                  onClick={handleAddComment}
                  disabled={commentLoading}
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </CardBody>
          </Card>
            </>

                  )}

        </Col>

        {/* RIGHT COLUMN */}
        {tabtype === "user" && (
          <Col xl="8" lg="7" xs={{ order: 0 }} md={{ order: 1, size: 7 }}>
            <UserTabs active={active} toggleTab={toggleTab} />
          </Col>
        )}
        {tabtype === "task" && (
        <Col lg="6" className="ps-lg-3">
          {selectedUser && <BasicTimeline taskId={selectedUser.id} />}
        </Col>
        )}

      </Row>

      {/* 🟢 Add Attachment Modal */}
      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        centered
      >
        <ModalHeader toggle={() => setModalOpen(false)}>
          Add Task Attachment
        </ModalHeader>
        <Form onSubmit={handleSubmitAttachment}>
          <ModalBody>
            <FormGroup>
              <Label for="taskId">Task ID</Label>
              <Input
                type="number"
                id="taskId"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="Enter Task ID"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="description">Description</Label>
              <Input
                type="text"
                id="description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Enter description"
              />
            </FormGroup>
            <FormGroup>
              <Label for="fileUpload">File</Label>
              <Input
                type="file"
                id="fileUpload"
                onChange={handleModalFileChange}
                required
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
            <Button color="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  ) : (
    <Alert color="danger">
      <h4 className="alert-heading">User not found</h4>
      <div className="alert-body">
        User with id: {id} doesn't exist. Check list of all Users:{" "}
        <Link to="/apps/user/list">Users List</Link>
      </div>
    </Alert>
  );
};

export default UserView;
