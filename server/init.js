// Run this script to test your schema
// Start the mongoDB service as a background process before running the script
// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let Comment = require('./models/comments')
let User = require('./models/users')

const bcrypt = require('bcrypt');
let mongoose = require('mongoose');
let mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let tags = [];
let answers = [];
function tagCreate(name, userId, tagCount) {
  let tag = new Tag({ name: name, userId:userId, tagCount:tagCount  });
  return tag.save();
}

function answerCreate(text, userId, ans_by, ans_date_time, comments, votes) {
  answerdetail = {text:text, userId:userId};
  if (ans_by != false) answerdetail.ans_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;
  if (comments != false) answerdetail.comments = comments;
  if (votes != false) answerdetail.votes = votes;

  let answer = new Answer(answerdetail);
  return answer.save();
}
function questionCreate(title, text, summary, tags, answers, asked_by, userId, ask_date_time, views, votes, comments) {
  qstndetail = {
    title: title,
    text: text,
    summary: summary,
    tags: tags,
    asked_by: asked_by,
    userId: userId
  }
  if (answers != false) qstndetail.answers = answers;
  if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
  if (views != false) qstndetail.views = views;
  if (votes != false) qstndetail.votes = votes;
  if (comments != false) qstndetail.comments = comments;

  let qstn = new Question(qstndetail);
  return qstn.save();
}

function commentCreate(content, votes, username, createdAt) {
    const commentDetail = {content:content, votes:votes, username:username};
    if (createdAt != false) commentDetail.createdAt = createdAt;  
    let comment = new Comment(commentDetail);
    return comment.save();
  }
async function userCreate(username, email, password, isAdmin) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);

  const userDetail = {
    username:username, 
    email:email, 
    passwordHash:passwordHash,
  };
  if (isAdmin != false) userDetail.isAdmin = isAdmin;
  let user = new User(userDetail);
  return user.save();
}

const populate = async () => {
  // u1 is associated with [q2,q4], [a1], [t3, t4]
  let u1 = await userCreate("Ricky","ricky.ii@gmail.com","gr@3fsQ!6");
  // u2 is associated with [q1,q6], [a3], [t1, t2]
  let u2 = await userCreate("SpringFlowers","daisy.pinkler.3@stonybrook.edu","ahiiy#@$sdf92");
  // u3 is associated with [q3, q5], [a2, a4], [t5, t6]
  let u3 = await userCreate("warpingbagel", "hit.by.a.bagel@yahoo.com", "password?");
  // u4 is associated with [a5]
  let u4 = await userCreate("UserFound", "x.goth32153@gmail.com", "theskyisnotblue");

  let c1 = await commentCreate('This is a acomment', 5, u1.username, false);
  let c2 = await commentCreate('This is a acomment2', 5, u4.username, false);
  let c3 = await commentCreate('This is a acomment3', 5, u2.username, false);
  let c4 = await commentCreate('This is a acomment4', 5, u1.username, false);
  let c5 = await commentCreate('This is a qcomment', 5, u2.username, false);
  let c6 = await commentCreate('This is a qcomment2', 5, u4.username, false);
  let c7 = await commentCreate('This is a qcomment3', 5, u4.username, false);
  let c8 = await commentCreate('This is a qcomment4', 5, u2.username, false);
  let t1 = await tagCreate('react', u1._id, 1);
  let t2 = await tagCreate('javascript', u2._id, 3);
  let t3 = await tagCreate('android-studio', u3._id, 1);
  let t4 = await tagCreate('shared-preferences', u4._id, 1);
  let t5 = await tagCreate('python', u1._id, 3);
  let t6 = await tagCreate('pandas', u2._id, 2);
  let a1 = await answerCreate('React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.', u1._id, 'Ricky', false, false, 1);
  let a2 = await answerCreate('On my end, I like to have a single history object that I can carry even outside components. I like to have a single history.js file that I import on demand, and just manipulate it. You just have to change BrowserRouter to Router, and specify the history prop. This doesn\'t change anything for you, except that you have your own history object that you can manipulate as you want. You need to install history, the library used by react-router.', u3._id, 'warpingbagel', false, [c1, c2, c3, c4], 2);
  let a3 = await answerCreate('Consider using apply() instead; commit writes its data to persistent storage immediately, whereas apply will handle it in the background.', u2._id, 'SpringFlowers', false, false, 3);
  let a4 = await answerCreate('YourPreference yourPrefrence = YourPreference.getInstance(context); yourPreference.saveData(YOUR_KEY,YOUR_VALUE);', u3._id, 'warpingbagel', false, false, 4);
  let a5 = await answerCreate('I just found all the above examples just too confusing, so I wrote my own. ', u4._id, 'UserFound', false, false, 5);

  let q1 = await questionCreate('Programmatically navigate using React router', 'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.', 'Sample summary 1', [t1, t2], [a1, a2], u2.username, u2._id, false, false, 6, [c5, c6, c7, c8]);
  let q2 = await questionCreate('android studio save string shared preference, start activity and load the saved string', 'I am using bottom navigation view but am using custom navigation, so my fragments are not recreated every time i switch to a different view. I just hide/show my fragments depending on the icon selected. The problem i am facing is that whenever a config change happens (dark/light theme), my app crashes. I have 2 fragments in this activity and the below code is what i am using to refrain them from being recreated.', 'Sample summary 2', [t3, t4, t2], [a3, a4, a5], u1.username, u1._id, false, 121, 7);
  let q3 = await questionCreate('How do I install pandas into Visual Studio Code?', 'I want to read an Excel CSV file, and after researching, I realized I need to import pandas as pd. Is there a way to install it into the Visual Studio Code?', 'Sample summary 3' ,[t5,t6], [], u3.username, u3._id, false, false, 7, []);
  let q4 = await questionCreate("Import pandas could not be resolved from source Pylance(reportMissingModuleSource)", "Previously to Visual Studio Code I installed \"Anaconda\" to use Jupyter, and now it says that i have the existing packages (pandas and numpy).", 'Sample summary 4' , [t5, t6], [], u1.username, u1._id, false, false, 10, []);
  let q5 = await questionCreate("How do I merge two dictionaries in a single expression in Python?", "I want to merge two dictionaries into a new dictionary. I want to merge two dictionaries into a new dictionary.", 'Sample summary 5' , [t5], [], u3.username, u3._id, false, false, 15, []);
  let q6 = await questionCreate("Loop (for each) over an array in JavaScript", "How can I loop through all the entries in an array using JavaScript?", 'Sample summary 6' , [t2], [], u2.username, u2._id, false, false, 100, []);

  if(db) db.close();
  console.log('done');
}

populate()
  .catch((err) => {
    console.log('ERROR: ' + err);
    if(db) db.close();
  });

console.log('processing ...');