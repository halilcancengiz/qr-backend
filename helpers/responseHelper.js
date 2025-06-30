const responseHelper = (res, statusCode, message, data = null) => {
    const response = { statusCode, message };
    
    if (data) response.data = data;

    return res.status(statusCode).json(response);
};

export default responseHelper;
