import '../stylesheets/App.css';

export default function Question(props) {
  const q = props.qData;
  const title = q.title;
  const summary = q.summary;
  const author = q.asked_by;
  const numAnswers = q.answers.length;
  const views = q.views;
  const id = q._id; 
  const askDate = q.ask_date_time;
  const votes = q.votes;
  // const uId = props.uId;
  
  // format each tag for a question
  const tList = q.tags.map(tag => (
    <span key={tag._id} className="question-tags">{tag.name}</span>
  ));
  return (
    <div className="question">
      <span className="question-stats-container">
        <div className="question-stats">{numAnswers} answers</div>
        <div className="question-stats">{views} views</div>
        <div>Votes: {votes}</div>
      </span>
      <span className="question-title-container">
          <button className="question-title" key={id} onClick={() => props.changeActive("Answers", id)}>{title}</button>
          <p className="question-summary">{summary}</p>
          {tList}
        </span>
        <span className="question-metadata-container">
          <span className="question-author">{author}</span>
          <span> asked {formatTime(askDate)}</span>
        </span>
    </div>
  );
}
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