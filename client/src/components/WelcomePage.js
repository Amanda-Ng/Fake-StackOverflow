import '../stylesheets/App.css';

export default function WelcomePage(props) {
  const changeActive = props.changeActive;
  return (
    <div id="welcome">
      <button onClick={() => {changeActive("Register")}}>Register</button>
      <button onClick={() => {changeActive("Login")}}>Login</button>
      <button>Guest</button>
    </div>
  );
}