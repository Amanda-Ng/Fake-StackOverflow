import '../stylesheets/App.css';
export default function NavBar(props) {
  const enterPressed = (e) => {
    if(e.key === 'Enter') {
      props.changeActive("Search");
      // changes searchString's state in App
      props.handleSearch(e.target.value);
    }
  };

  return (
    <div id="header" className="header">
      <h1 className="header-title">Fake Stack Overflow</h1>
      <input id="search" type="text" placeholder="Search . . ." onKeyDown={enterPressed} />
    </div>
  );
}