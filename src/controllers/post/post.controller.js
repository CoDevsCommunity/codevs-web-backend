/* eslint-disable no-underscore-dangle, no-unused-expressions */
const Post = require('../../database/models/Post');
const User = require('../../database/models/User');

const postController = {};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

postController.getPosts = async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Success',
      data: await Post.find({ state: 'public' }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

postController.getPost = async (req, res) => {
  try {
    const { title, author } = req.body;
    if (!title || !author) {
      return res.status(400).json({
        message: 'Bad Request, please provided correct title and author',
      });
    }
    const PostFound = await Post.findOne({
      title,
      author,
    });

    if (PostFound === null || PostFound.state === 'private') {
      return res.status(404).json({
        message: 'Post does not exist or is private',
      });
    }

    return res.status(200).json({
      message: 'success',
      data: PostFound,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

postController.createPost = async (req, res) => {
  try {
    const { title, bannerURL, content, author, userId } = req.body;

    if (!title || !bannerURL || !content || !author || !userId) {
      return res.status(400).json({
        message:
          'Bad Request, Please provide correct title, bannerURL, content, author and userId',
      });
    }

    const PostFound = await Post.findOne({
      title,
      author,
    });
    const UserFound = await User.findOne({ username: author }).select(
      '-password -email -upLikes -downLikes'
    );

    if (PostFound !== null) {
      return res.status(403).json({
        message: 'a post has already created that title',
      });
    }
    if (UserFound === null) {
      return res.status(403).json({
        message: 'a user not exists',
      });
    }

    const PostCreate = new Post({
      title,
      banner: bannerURL,
      content,
      author,
    });

    await PostCreate.save();

    await User.updateOne(
      { username: author },
      {
        $inc: {
          publications: 1,
        },
      }
    );

    return res.status(201).json({
      message: 'Created',
      data: PostCreate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

postController.updatePost = async (req, res) => {
  try {
    const {
      postId,
      author,
      userId,
      newTitle,
      newBannerURL,
      newContent,
    } = req.body;

    if (!postId || !author || !userId) {
      return res.status(400).json({
        message:
          'Bad Request, Please provide correct postId, author, userId, newTitle, newBannerURL and newContent',
      });
    }
    const postFound = await Post.findOne({ _id: postId, author });
    if (postFound == null) {
      return res.status(200).json({
        message:
          'The publication you want to update does not exist, please provide correct data',
      });
    }

    if (
      postFound.title === newTitle &&
      postFound.banner === newBannerURL &&
      postFound.content === newContent
    ) {
      return res.status(426).json({
        messsage:
          'It seems that you have not made any change to update the post, try again',
      });
    }

    await Post.findOneAndUpdate(
      { _id: postId, author },
      {
        title: newTitle || postFound.title,
        banner: newBannerURL || postFound.banner,
        content: newContent || postFound.content,
        update_At: Date.now(),
      }
    );

    console.log('Post Updated');
    return res.status(200).json({
      message: 'Post Updated Success',
      data: await Post.findOne({ _id: postId, author }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

postController.removePost = async (req, res) => {
  try {
    const { postId, author, userId } = req.body;
    if (!postId || !author || !userId) {
      return res.status(400).json({
        message:
          'Bad Request, Please provide correct postId, author and userId.',
      });
    }

    const PostFound = await Post.findOne({ _id: postId, author });

    if (PostFound === null) {
      return res.status(200).json({
        message:
          'The post he wants to eliminate does not exist, please provide correct data',
      });
    }

    return res.status(200).json({
      message: 'Success, Post Deleted',
      data: await Post.findOneAndDelete({ _id: postId, author }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

postController.updateState = async (req, res) => {
  try {
    const { title, author, state, userId } = req.body;

    const states = ['public', 'private'];

    if (!title || !author || !state || !states.includes(state) || !userId) {
      return res.status(400).json({
        message:
          'Bad Request, Please provide correct title, author, state and userId',
      });
    }

    if ((await Post.findOne({ title, author })) == null) {
      return res.status(400).json({
        message:
          'The post you want to change the state does not exist, please provide correct data',
      });
    }

    await Post.findOneAndUpdate(
      { title, author },
      {
        state,
      }
    );

    console.log('Post State Updated');
    return res.status(200).json({
      message: 'Success',
      data: await Post.findOne({ title, author }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

postController.addView = async (req, res) => {
  try {
    const { postId, author, userId } = req.body;

    if (!postId || !author || !userId) {
      return res.status(400).json({
        message:
          'Bad Request, Please provide correct postId, author and userId.',
      });
    }

    let viewed = false;
    const PostFound = await Post.findOne(
      { _id: postId, author },
      async (err, post) => {
        post.views.find((viewer) => viewer.user._id.toString() === userId)
          ? (viewed = true)
          : null;
      }
    );

    if (PostFound == null || PostFound.state === 'private') {
      return res.status(400).json({
        message:
          'Bad Request, The publication you want to add a view does not exist, or is private.',
      });
    }

    const UserFound = await User.findOne({ _id: userId }).select(
      '-password -email -firstName -lastName -state -admin -socialLinks -exp -upLikes -downLikes -followers -following -postLikes -comments'
    );

    if (UserFound == null) {
      return res.status(200).json({
        message:
          'Success, If the user is not registered, a view will not be added',
      });
    }

    if (UserFound.username === author) {
      return res.status(406).json({
        message: 'You can not add your sight, to your post',
      });
    }

    if (viewed) {
      return res.status(200).json({
        message: 'You have already seen this publication before.',
      });
    }

    await Post.findOneAndUpdate(
      { _id: postId, author },
      {
        $push: {
          views: {
            user: UserFound,
          },
        },
      }
    );

    console.log('Post views added');
    return res.status(200).json({
      message: 'Success, post view added.',
      data: await Post.findOne({ _id: postId, author }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

postController.addComment = async (req, res) => {
  try {
    const { postId, author, userId, comment } = req.body;

    if (!postId || !author || !userId || !comment) {
      return res.status(400).json({
        message:
          'Bad Request, Please provide correct postId, author, userId and comment.',
      });
    }

    if (comment.length < 1) {
      return res.status(411).json({
        message: 'The comment is very small, you must have more than 1 length',
      });
    }

    const arr = [];
    const double = [];
    const commentArray = comment.toLowerCase().split(' ');
    const range = (comment.length / 250) * 8;
    const repeated = {};

    // Repeated words
    // eslint-disable-next-line array-callback-return
    commentArray.filter((c, index) => {
      double.push(commentArray.indexOf(c) !== index);
    });

    double.forEach((number) => {
      repeated[number] = (repeated[number] || 0) + 1;
    });

    // Validation spam
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i <= commentArray.length; i++) {
      if (
        commentArray[i] === commentArray[i + 1] &&
        commentArray[i] === commentArray[i - 1]
      ) {
        arr.push('');
      } else if (
        commentArray[i] === commentArray[i + 2] &&
        commentArray[i] === commentArray[i - 2]
      ) {
        arr.push('');
      } else if (commentArray[i] === /\b(?=\w*(\w)\1)\w+\b/g) {
        arr.push('');
      } else if (repeated.true > range) {
        arr.push('');
      }
    }

    if (arr.length !== 0) {
      return res.status(406).json({
        message: 'Comment has been considered as spam',
      });
    }

    let commentedSize = 0;
    let commentRepeated = false;
    const PostFound = await Post.findOne(
      { _id: postId, author },
      async (err, post) => {
        try {
          if (!post.comments) {
            return;
          }
          const comments = post.comments.filter(
            (commentator) =>
              commentator.commenter.user._id.toString() === userId
          );

          // eslint-disable-next-line no-unused-expressions
          comments.length > 0 ? (commentedSize = comments.length) : null;

          const findCommentsRepeated = post.comments.filter((commentator) =>
            comments.find(
              (commenter) =>
                commenter.commenter.comment === commentator.commenter.comment
            )
          );
          // eslint-disable-next-line no-unused-expressions
          findCommentsRepeated.length ? (commentRepeated = true) : null;
        } catch (error) {
          console.error(error);
        }
      }
    );

    if (PostFound == null || PostFound.state === 'private') {
      return res.status(400).json({
        message:
          'Bad Request, The publication you want to add a comment does not exist, or is private.',
      });
    }

    const UserFound = await User.findOne({ _id: userId }).select(
      '_id username socialMedia'
    );

    if (UserFound == null) {
      return res.status(200).json({
        message:
          'Success, If the user is not registered, a comment will not be added.',
      });
    }

    if (commentRepeated) {
      return res.status(403).json({
        message:
          'Forbidden, you have already commented several times the same commentary on this publication before.',
      });
    }

    if (commentedSize > 50) {
      return res.status(403).json({
        message: 'Forbidden, You have already commented too much this article.',
      });
    }

    await Post.findOneAndUpdate(
      { _id: postId, author },
      {
        $push: {
          comments: {
            commenter: {
              user: UserFound,
              comment,
            },
          },
        },
      }
    );

    console.log('Post comment added');
    return res.status(200).json({
      message: 'Success, post comment added',
      data: await Post.findOne({ _id: postId, author }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

postController.updateComment = async (req, res) => {
  try {
    const { postId, commentId, newComment, userId } = req.body;

    if (!postId || !commentId || !newComment || !userId) {
      return res.status(400).json({
        message:
          'Bad Request, Please provide correct postId, userId, commentId and newComment.',
      });
    }
    if (commentId.length < 24) {
      return res.status(411).json({
        message: 'The comment ID is very small, you must have more length',
      });
    }

    let commentExist = false;
    const PostFound = await Post.findOne({ _id: postId }, async (err, post) => {
      post.comments.find(
        (commentator) =>
          commentator._id.toString() === commentId &&
          commentator.commenter.user._id.toString() === userId
      )
        ? (commentExist = true)
        : null;
    });

    if (PostFound == null || PostFound.state === 'private') {
      return res.status(400).json({
        message:
          'Bad Request, The publication you want to add a view does not exist, or is private.',
      });
    }

    const UserFound = await User.findOne({ _id: userId }).select(
      '-password -email -firstName -lastName -state -admin -socialLinks -exp -upLikes -downLikes -followers -following -postLikes -views'
    );

    if (UserFound == null) {
      return res.status(200).json({
        message:
          'Success, If the user is not registered, a delete comment will not be added.',
      });
    }

    if (!commentExist) {
      return res.status(404).json({
        message:
          'Not found, The comment you want to update is not found, or you are not the owner of this.',
      });
    }

    await Post.findOneAndUpdate(
      { _id: postId },
      {
        comments: {
          _id: commentId,
          commenter: {
            comment: newComment,
          },
        },
      }
    );

    console.log('Post comment Updated');
    return res.status(200).json({
      message: 'Success, post comment updated',
      data: await Post.findOne({ _id: postId }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

postController.removeComment = async (req, res) => {
  try {
    const { postId, commentId, userId } = req.body;

    if (!postId || !commentId || !userId) {
      return res.status(400).json({
        message:
          'Bad Request, Please provide correct postId, commentId and userId.',
      });
    }
    if (commentId.length < 24) {
      return res.status(411).json({
        message: 'The comment ID is very small, you must have more length',
      });
    }

    let commentExist = false;
    const PostFound = await Post.findOne({ _id: postId }, async (err, post) => {
      post.comments.find(
        (commentator) =>
          commentator._id.toString() === commentId &&
          commentator.commenter.user._id.toString() === userId
      )
        ? (commentExist = true)
        : null;
    });

    if (PostFound == null || PostFound.state === 'private') {
      return res.status(400).json({
        message:
          'Bad Request, The publication you want to add a view does not exist, or is private.',
      });
    }

    const UserFound = await User.findOne({ _id: userId }).select(
      '-password -email -firstName -lastName -state -admin -socialLinks -exp -upLikes -downLikes -followers -following -postLikes -views'
    );

    if (UserFound == null) {
      return res.status(200).json({
        message:
          'Success, If the user is not registered, a delete comment will not be added.',
      });
    }

    if (!commentExist) {
      return res.status(404).json({
        message:
          'Not found, The comment you want to delete is not found, or you are not the owner of this.',
      });
    }

    await Post.findOneAndUpdate(
      { _id: postId },
      {
        $pull: {
          comments: {
            _id: commentId,
          },
        },
      }
    );

    console.log('Post comment deleted');
    return res.status(200).json({
      message: 'Success, post comment deleted',
      data: await Post.findOne({ _id: postId }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

module.exports = postController;
