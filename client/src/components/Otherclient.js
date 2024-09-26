import { useNavigate } from "react-router-dom";

function Otherclient (){
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/Otherclient/OtherClientsTables');
  };
  const onHandleClick = () => {
    navigate('/Otherclient/OtherClientsData');
  };
  const Click = () => {
    navigate('/Otherclient/AddOtherClients');
  };


  return(
    <div className="main-content">
      <button onClick={Click}>Add Other Clients </button>
      <button onClick={handleClick}>Other Clients Tables</button>
      <button onClick={onHandleClick}>Other Clients Data's</button>
    </div>
  );
}
export default Otherclient;