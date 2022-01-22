import { HttpStatus } from '@nestjs/common';

const httpResponse = {
    OK: {
        statusCode: HttpStatus.OK,
        result: "success",
        message: "OK"
    },
    CREATED: {
        statusCode: HttpStatus.CREATED,
        result: "success",
        message: "Created"
    },
    BAD_REQUEST: {
        statusCode: HttpStatus.BAD_REQUEST,
        result: "bad_request",
        message: "Bad Request"
    },
    UNAUTHORIZED: {
        statusCode: HttpStatus.UNAUTHORIZED,
        result: "unauthorized",
        message: "Unauthorized"
    },
    NOT_FOUND: {
        statusCode: HttpStatus.NOT_FOUND,
        result: "not_found",
        message: "Not Found"
    },
    CONFLICT: {
        statusCode: HttpStatus.CONFLICT,
        result: "conflict",
        message: "Conflict"
    },
    UNPROCESSABLE_ENTITY: {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        result: "unprocessable_entity",
        message: "Unprocessable Entity"
    },
    INTERNAL_SERVER_ERROR: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        result: "internal_server_error",
        message: "Internal Server Error"
    }
}

export default httpResponse;