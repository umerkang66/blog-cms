import { BadRequestError, getCurrentuser, requireAuth } from '@blog-cms/common';
import { Request, Response, Router } from 'express';
import { User } from '../models/user';

const router = Router();
const currentuserMid = getCurrentuser(User);

interface RequestBody {
  [key: string]: string;
}
type CustomRequest = Request<{}, {}, RequestBody>;

router.patch(
  '/api/users/update-me',
  currentuserMid,
  requireAuth,
  async (req: CustomRequest, res: Response) => {
    const filteredBody = filterReqBody(req.body, 'name', 'email');

    if (filteredBody.email) {
      if (!filteredBody.email.includes('@')) {
        throw new BadRequestError('please provide a valid email');
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.currentuser!.id,
      filteredBody,
      {
        // make sure always pass these two
        new: true,
        runValidators: true,
      }
    );

    res.send(updatedUser);
  }
);

// Utils of this file
function filterReqBody(
  reqBody: RequestBody,
  ...allowedFields: string[]
): RequestBody {
  const newObj: RequestBody = {};

  for (const key in reqBody) {
    if (allowedFields.includes(key)) {
      newObj[key] = reqBody[key];
    }
  }

  return newObj;
}

export { router as updateMeRouter };
