


const asyncHandler = (requestHandler) =>
  // Returns a middleware function that wraps around the requestHandler
  (req, res, next) => {
    // Resolve the requestHandler promise and catch any errors
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      console.log("ERROR FROM REQUEST HANDLER FUNCTION: " + err);
      next(err);
    });
  };


export default asyncHandler






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
