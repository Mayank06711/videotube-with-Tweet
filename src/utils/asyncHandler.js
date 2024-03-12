const aysncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      console.log("ERROR FROM REQEUSTHANDLER FUNCTION : " + err);
      next(err);
    });
  };
};

export { aysncHandler };

//----------------------------------------------------------------
//     -------- creating higher level handlers which take function  arguments and return function   using trycatch
// const aysncHandler =(func)=>{()=>{}}
// const aysncHandler =(func)=>{aysnc ()=>{}}
//------------------------------------------------------------------------------------------------
// const aysncHandler =(func)=>{async (req, res, next)=>{
//     try{
//         await func(req, res, next)
//     }catch(err){
//         res.status(err.code|| 500).json({
//             success: false,
//             message: "ERROR : " + err.message,
//         })
//         next(err)
//     }
// }}
