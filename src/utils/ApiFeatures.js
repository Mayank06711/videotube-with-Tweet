class ApiFeature {
    constructor(query, queryStr) {
        // Assign the query (Mongoose query object) to this.query
        this.query = query;
        // Assign the query string (typically from req.query) to this.queryStr
        this.queryStr = queryStr;
    }

    custom_Filter() {
        // Convert the queryStr object to a JSON string
        let queryString = JSON.stringify(this.queryStr);
        // Replace gte, gt, lte, lt with $gte, $gt, $lte, $lt for MongoDB query syntax
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // Parse the modified queryString back to a JavaScript object
        const queryObject = JSON.parse(queryString);
        // Apply the queryObject as a filter to the query
        this.query = this.query.find(queryObject);
        // Return this to allow method chaining
        return this; // return instance of this ApiFeature class so that in future we can chain the methods
        // this represent current obj
    }
    

    custom_Sort() {
        // Check if the sort parameter exists in the query string
        if (this.queryStr.sort) {
            // Replace commas with spaces to use in Mongoose sort method
            const sortBy = this.queryStr.sort.split(",").join(" ");
            // Apply the sort order to the query
            this.query = this.query.sort(sortBy);
        } else {
            // Default sort by createdAt field in descending order if no sort parameter is specified
            this.query = this.query.sort("-createdAt");
        }
        // Return this to allow method chaining
        return this;
    }
  
    custom_LimitFields() {
        // Check if the fields parameter exists in the query string
        if (this.queryStr.fields) {
            // Replace commas with spaces to use in Mongoose select method
            const fields = this.queryStr.fields.split(",").join(" ");
            // Select only the specified fields
            this.query = this.query.select(fields);
        } else {
            // Exclude the __v field by default
            this.query = this.query.select("-__v");
        }
        // Return this to allow method chaining
        return this;
    }

     
    custom_Paginate() {
        // Convert the page parameter to a number, default to 1 if not specified
        const page = this.queryStr.page * 1 || 1;
        // Convert the limit parameter to a number, default to 10 if not specified
        const limit = this.queryStr.limit * 1 || 10;
        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;
        // Apply skip and limit to the query for pagination
        this.query = this.query.skip(skip).limit(limit);
        // Return this to allow method chaining
        return this;
    }
   
}


export default ApiFeature; // Ensure this is added to export the class for use in other modules



                             // how to use it 
//   const xyz = new ApiFeature(ModelName.find(), req.query)




/**         
    ---------Differences between----------

   await ModelName.find(): Immediately resolves the query and returns the documents.Type: This returns a promise that resolves to the result of the query.
   ModelName.find(): Returns a Query object that needs to be executed to get the documents. Type: This returns a Mongoose Query object, which can be used to build more complex queries or be executed later. The query needs to be executed separately using .then(), .exec(), or await to get the result same as await ModelName.find().
   
            -----------Use Cases-----------:
   Use await ModelName.find() when you want to immediately execute the query and work with the data.
   Use ModelName.find() when you need to build up a query incrementally or want to chain additional query methods before executing it.
   */