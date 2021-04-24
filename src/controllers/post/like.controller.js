/* eslint-disable no-underscore-dangle, no-unused-expressions */

const Post = require('../../database/models/Post');
const User = require('../../database/models/User');

const likeController = {};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

likeController.getLikes = async (req, res) => {
  try {
    const { id: postId, author } = req.body;

    if (!postId || !author) {
      return res.status(400).json({
        message: 'Bad Request, please provided correct id and author',
      });
    }

    const PostFound = await Post.findOne({ _id: postId, author });

    if (PostFound === null || PostFound.state === 'private') {
      return res.status(404).json({
        message: 'Post does not exist or is private',
      });
    }

    return res.status(200).json({
      message: 'success',
      data: await Post.findOne({ _id: postId, author }).select(
        'upLikes downLikes author update_At created_At'
      ),
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

likeController.upLike = async (req, res) => {
  try {
    const { postId, author, userId } = req.body;
    if (!postId || !author || !userId) {
      return res.status(400).json({
        message: 'Bad Request, Provide correct id, author and username',
      });
    }

    const getPostToLike = await Post.findOne({
      _id: postId,
      author,
    });

    if (getPostToLike == null || getPostToLike.state === 'private') {
      return res.status(200).json({
        message: 'The post to whom you want like does not exist or is private',
      });
    }

    let isLiked = false;
    let isDownLiked = false;
    await Post.findOne({ _id: postId, author }, async (err, post) => {
      // eslint-disable-next-line no-underscore-dangle, no-unused-expressions
      post.upLikes.filter((likes) => likes.user._id.toString() === userId)
        .length
        ? (isLiked = true)
        : null;

      // eslint-disable-next-line no-underscore-dangle, no-unused-expressions
      post.downLikes.filter((likes) => likes.user._id.toString() === userId)
        .length
        ? (isDownLiked = true)
        : null;
    });
    if (isLiked) {
      return res.status(200).json({
        message: 'you are already likes this post',
      });
    }

    if (isDownLiked) {
      // Remove the user with the post to which Downlike gave him.

      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            downLikes: {
              post: await Post.findOne({ _id: postId }).select(
                '+_id -update_At -comments'
              ),
            },
          },
        }
      );

      // remover DownLike from post

      await Post.updateOne(
        { _id: postId },
        {
          $pull: {
            downLikes: {
              user: await User.findOne({ _id: userId }).select(
                '+_id -password -email -following -followers -firstName -lastName -upLikes -downLikes'
              ),
            },
          },
        }
      );
    }

    // Add Uplike to the post that the user wants to give Uplike

    await Post.updateOne(
      { _id: postId, author },
      {
        $push: {
          upLikes: {
            user: await User.findOne({ _id: userId }).select('_id'),
          },
        },
      }
    );

    // Add post user uplikes

    await User.updateOne(
      { _id: userId },
      {
        $push: {
          upLikes: {
            post: await Post.findOne({ _id: postId }).select('_id'),
          },
        },
      }
    );

    return res.status(201).json({
      message: 'User UpLike Success',
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

likeController.removeUpLike = async (req, res) => {
  try {
    const { postId, author, userId } = req.body;
    if (!postId || !author || !userId) {
      return res.status(400).json({
        message: 'Bad Request, Provide correct id, author and username',
      });
    }

    const getPostToRemoveLike = await Post.findOne({
      _id: postId,
      author,
    });
    if (
      getPostToRemoveLike == null ||
      getPostToRemoveLike.state === 'private'
    ) {
      return res.status(200).json({
        message: 'post not found, or private',
      });
    }

    let isLiked = false;
    const getLikedPost = await Post.findOne(
      { _id: postId, author },
      async (err, post) => {
        if (post.upLikes.length === 0) {
          return;
        }

        post.upLikes.filter((likes) => likes.user._id.toString() === userId)
          ? (isLiked = true)
          : null;
      }
    );
    if (!isLiked || getLikedPost === null || getLikedPost.state === 'private') {
      return res.status(200).json({
        message:
          'To the publication you want to eliminate the UpLike, you have not UpLiked it before, or it does not exist or is private.',
      });
    }

    // remove to the user the post to which he gave

    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          upLikes: {
            post: await Post.findOne({ _id: postId }).select('_id'),
          },
        },
      }
    );

    // remover like del usuario al post que el usuario quiere dar el like

    await Post.updateOne(
      { _id: postId },
      {
        $pull: {
          upLikes: {
            user: await User.findOne({ _id: userId }).select('_id'),
          },
        },
      }
    );

    return res.status(201).json({
      message: 'User remove UpLike success',
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

likeController.downLike = async (req, res) => {
  try {
    const { postId, author, userId } = req.body;
    if (!postId || !author || !userId) {
      return res.status(400).json({
        message: 'Bad Request, Provide correct id, author and username',
      });
    }

    const getPostToLike = await Post.findOne({
      _id: postId,
      author,
    });

    if (getPostToLike == null || getPostToLike.state === 'private') {
      return res.status(200).json({
        message: 'The post to whom you want like does not exist or is private',
      });
    }

    let isLiked = false;
    let isUpLiked = false;
    await Post.findOne({ _id: postId, author }, async (err, post) => {
      // eslint-disable-next-line no-underscore-dangle, no-unused-expressions
      post.downLikes.filter((likes) => likes.user._id.toString() === userId)
        .length
        ? (isLiked = true)
        : null;

      // eslint-disable-next-line no-underscore-dangle, no-unused-expressions
      post.upLikes.filter((likes) => likes.user._id.toString() === userId)
        .length
        ? (isUpLiked = true)
        : null;
    });
    if (isLiked) {
      return res.status(200).json({
        message: 'you are already DownLike this post',
      });
    }

    if (isUpLiked) {
      // remove to the user the post to which he gave

      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            upLikes: {
              post: await Post.findOne({ _id: postId }).select('_id'),
            },
          },
        }
      );

      // remover like del usuario al post que el usuario quiere dar el like

      await Post.updateOne(
        { _id: postId },
        {
          $pull: {
            upLikes: {
              user: await User.findOne({ _id: userId }).select('_id'),
            },
          },
        }
      );
    }

    // Add user downlike to the post that the user wants to give the downlike

    await Post.updateOne(
      { _id: postId, author },
      {
        $push: {
          downLikes: {
            user: await User.findOne({ _id: userId }).select('_id'),
          },
        },
      }
    );

    // Add to the user the post to which he gave

    await User.updateOne(
      { _id: userId },
      {
        $push: {
          downLikes: {
            post: await Post.findOne({ _id: postId }).select('_id'),
          },
        },
      }
    );

    return res.status(201).json({
      message: 'User DownLike Success',
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

likeController.removeDownLike = async (req, res) => {
  try {
    const { postId, author, userId } = req.body;
    if (!postId || !author || !userId) {
      return res.status(400).json({
        message: 'Bad Request, Provide correct id, author and username',
      });
    }

    const getPostToRemoveLike = await Post.findOne({
      _id: postId,
      author,
    });
    if (
      getPostToRemoveLike == null ||
      getPostToRemoveLike.state === 'private'
    ) {
      return res.status(200).json({
        message: 'post not found, or private',
      });
    }

    let isLiked = false;
    const getLikedPost = await Post.findOne(
      { _id: postId, author },
      async (err, post) => {
        // eslint-disable-next-line no-underscore-dangle, no-unused-expressions
        post.downLikes.filter((likes) => likes.user._id.toString() === userId)
          .length
          ? (isLiked = true)
          : null;
      }
    );
    if (!isLiked || getLikedPost === null || getLikedPost.state === 'private') {
      return res.status(200).json({
        message:
          'To the publication you want to eliminate the downLike, you have not downLiked it before, or it does not exist or is private.',
      });
    }

    // remove to the user the post to which he gave

    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          downLikes: {
            post: await Post.findOne({ _id: postId }).select('_id'),
          },
        },
      }
    );

    // Remover user downlike to the post that the user wants to remove the downlike

    await Post.updateOne(
      { _id: postId },
      {
        $pull: {
          downLikes: {
            user: await User.findOne({ _id: userId }).select('_id'),
          },
        },
      }
    );

    return res.status(201).json({
      message: 'User remove DownLike success',
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

module.exports = likeController;
