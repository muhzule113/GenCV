// Middleware untuk validasi request body menggunakan Zod
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = (error.issues || error.errors || []).map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({
          error: 'Validasi gagal',
          details: errors
        });
      }
      next(error);
    }
  };
};

// Middleware untuk validasi request params
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = (error.issues || error.errors || []).map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({
          error: 'Parameter tidak valid',
          details: errors
        });
      }
      next(error);
    }
  };
};

// Middleware untuk validasi request query
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = (error.issues || error.errors || []).map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({
          error: 'Query parameter tidak valid',
          details: errors
        });
      }
      next(error);
    }
  };
};
