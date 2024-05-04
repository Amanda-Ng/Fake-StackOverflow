import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ACommentsList(props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(props.comments);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const commentsPerPage = 3;

  const qid = props.qid;
  const aid = props.aid;

  const checkLoggedInStatus = async () => {
    try {
      const response = await axios.get("http://localhost:8000/getLoggedIn");
      setIsLoggedIn(response.data.loggedIn);
    } catch (error) {
      console.error('Error getting logged in status:', error);
    }
  };

    // Effect hook to check login status on component mount
    useEffect(() => {
      checkLoggedInStatus();
    }, []); // runs once on component mount

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/answers/${aid}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments(); // Fetch comments when component mounts or when aid prop changes

    return () => {
    };
  }, [aid]); // Trigger effect when aid prop or comments changes

  // Pagination
  const totalPages = Math.ceil(comments.length / commentsPerPage);
  const endIndex = currentPage * commentsPerPage;
  const startIndex = endIndex - commentsPerPage;
  // const currentComments = comments.slice(startIndex, endIndex);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (validateCommentForm(newComment)) {

    try {
      // Send POST request to add new comment
      await axios.post(`http://localhost:8000/answer/${aid}/comments`, { content: newComment }, {
        headers: {
            'Content-Type': 'application/json'
        }
      });
      
      // Clear input after submission
      setNewComment('');

      // refresh comments
      const response = await axios.get(`http://localhost:8000/answers/${aid}/comments`);
      setComments(response.data); // Update state with fetched comments

      props.changeActive('Answers', qid);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }};

  const onCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleUpvote = async (commentId) => {
    try {
      await axios.put(`http://localhost:8000/answers/comments/${commentId}/votes`);

    // // Update the local comments state to reflect the updated votes
    // const updatedComments = comments.map((comment) => {
    //   if (comment._id === commentId) {
    //     return { ...comment, votes: comment.votes + 1 };
    //   }
    //   return comment;
    // });
    // setComments(updatedComments);
    const response = await axios.get(`http://localhost:8000/answers/${aid}/comments`);
    setComments(response.data); // Update state with fetched comments

    props.changeActive('Answers', qid);

    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };
  
  return (
    <div className="comments-container">
      {/* Display current comments */}
      <div className="comments-list">
        {comments.slice(startIndex, endIndex).map((comment) => (
          <div key={comment._id} className="comment-item">
            <button className="upvote-btn" onClick={() => handleUpvote(comment._id)} disabled={!isLoggedIn}>Upvote</button>
            <span className="cVotes">{comment.votes}</span>
            <span>{comment.content}</span>
            <span className="comment-metadata">
                <span className="cUser"> - {comment.username}</span>
                <span className="cTime"> commented {formatTime(comment.createdAt)}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="comments-pagination">
          <button
            onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            onClick={() => paginate(
              currentPage === totalPages ? 1 : currentPage + 1)}
          >
            Next
          </button>
        </div>  

      {/* Input field for adding new comments */}
      <form onSubmit={handleCommentSubmit} className="comment-form">
        <input
          type="text"
          name="comment"
          placeholder="Add a new comment..."
          value={newComment}
          onChange={onCommentChange}
          disabled={!isLoggedIn}
        />
        <button type="submit" disabled={!isLoggedIn}>Submit</button>
      </form>
    </div>
  );
};

function formatTime(date) {
  const now = new Date();
  date = new Date(date); // JSON passes everything as Strings, so convert to Date here
  const diff = Math.floor((now - date) / 1000); // difference in seconds
  if (diff < 60) { return `${diff} seconds ago`; }
  if (diff < 3600) { return Math.floor(diff / 60) + " minutes ago"; } // less than an hour
  if (diff < 86400) { return Math.floor(diff / 3600) + " hours ago"; } // less than a day
  const month = date.toLocaleString('default', { month: 'short' }); // get shortened month name
  const day = date.getDate();
  const hour = ('0'+date.getHours()).slice(-2); // slice for leading 0s
  const minute = ('0'+date.getMinutes()).slice(-2); // slice for leading 0s
  if (diff < 31536000) { return `${month} ${day} at ${hour}:${minute}`; } // less than a year
  const year = date.getFullYear();
  return `${month} ${day}, ${year} at ${hour}:${minute}`;
}

// TODO: add reputation constraint
function validateCommentForm(content) {
  if (content.length > 140) {
    alert("Comment content should be 140 characters or less.");
    return false;
}
  return true;
}