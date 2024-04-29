import React, { useState } from 'react';
import axios from 'axios';

export default function CommentsList(props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const commentsPerPage = 3;

  const comments = props.comments;
  const aid = props.aid;

  // Pagination
  const endIndex = currentPage * commentsPerPage;
  const startIndex = endIndex - commentsPerPage;
  const currentComments = comments.slice(startIndex, endIndex);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCommentSubmit = async (event) => {
    // event.preventDefault();
    // try {
    //   // Send POST request to add new comment
    //   await axios.post(`http://localhost:8000/${aid}/comments`, { content: newComment }, {
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    //   });
      
    //   // Clear input after submission
    //   setNewComment('');
      
    //   // refresh comments here
    // } catch (error) {
    //   console.error('Error adding comment:', error);
    // }
  };

  const onCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleUpvote = async (commentId) => {
    // try {
    //   const response = await axios.put(`http://localhost:8000/comments/${commentId}/votes`);
    //   console.log('Vote updated successfully:', response.data);

    //   // Update the local comments state to reflect the updated votes
    //   const updatedComments = comments.map((comment) => {
    //     if (comment._id === commentId) {
    //       return { ...comment, votes: comment.votes + 1 };
    //     }
    //     return comment;
    //   });
    //   setComments(updatedComments);
    // } catch (error) {
    //   console.error('Error updating votes:', error);
    //   // Handle error (e.g., display an error message)
    // }
  };
  
  return (
    <div className="comments-container">
      {/* Display current comments */}
      <div className="comments-list">
        {currentComments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <button className="upvote-btn" onClick={() => handleUpvote(comment._id)}>Upvote</button>
            <span>{comment.votes}     </span>
            <span>{comment.content}   </span>
            <span>
              {/* TODO: add username */}
                {/* <span className="cUser">{comment.user.username}</span> */}
                <span> commented {formatTime(comment.createdAt)}</span>
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
              currentPage < Math.ceil(comments.length / commentsPerPage) ?
              currentPage + 1 :
              Math.ceil(comments.length / commentsPerPage)
            )}
            disabled={currentPage === Math.ceil(comments.length / commentsPerPage)}
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
        />
        <button type="submit">Submit</button>
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