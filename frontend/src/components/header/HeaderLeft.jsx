function HeaderLeft({ toggle, setToggle }){
    return (
      <div className="header-left">
        <div className="header-logo">
         
       
        </div>
        <div onClick={() => setToggle((prev) => !prev)} className="header-menu">
          {toggle ? (
            <i className="bi bi-x-lg"></i>
          ) : (
            <i className="bi bi-list"></i>
          )}
            
        </div>
        <img src="OFPPT.ico" alt="" />
      </div>
      
    );
  };
  
  export default HeaderLeft;
  