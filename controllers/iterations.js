import { Post } from "../models/post.js"
import { Profile } from "../models/profile.js"
import { Iteration } from "../models/iteration.js"

const newIteration = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    const posts = await Post.find({ topic: post.topic }, 'iterations')
      .populate({
        path: 'iterations',
        select: 'text rating',
        options: { sort: { 'rating': 'desc' } }
      })

    res.status(201).json(posts)
  } catch (err) {
    res.status(500).json(err)
  }
}

const createIteration = async (req, res) => {
  try {
    const iteration = await Iteration.create(req.body)
    await Post.updateOne(
      { _id: req.params.id },
      { $push: { iterations: iteration } }
    )
    res.status(201).json(iteration)
  } catch (err) {
    res.status(500).json(err)
  }
}

const castVote = async (req, res) => {
  try {
    const vote = req.body.vote
    const { iterationId, postId } = req.params

    const post = await Post.findById(postId)
    const iteration = await Post.findById(iterationId)

    if (iteration.votes.find((v) => v.profileId === req.user.profile)) {
      return res.status(401).json({
        msg: `You cannot ${vote === 1 ? 'upvote' : 'downvote'} the same post twice!`
      })
    }

    if (post.author.equals(req.user.profile)) {
      return res.status(401).json({ msg: 'You cannot vote for your own post.' })
    }

    iteration.rating += vote
    iteration.votes.push({ vote: vote, profileId: req.user.profile })
    await iteration.save()
    res.status(200).json(iteration)
  } catch (err) {
    res.status(500).json(err)
  }
}

const undoVote = async (req, res) => {
  try {
    const { iterationId } = req.params
    const iteration = await Iteration.findById(iterationId)
    const prev = iteration.votes.find((v) => v.profileId === req.user.profile)
    if (!prev) { return res.status(404).json({ msg: 'Vote note found!' }) }
    iteration.rating -= prev.vote
    iteration.votes.remove({ _id: prev._id })
    await iteration.save()
    res.status(200).json(iteration)
  } catch (err) {
    res.status(500).json(err)
  }
}

const createComment = async (req, res) => {
  try {
    const iteration = await Iteration.findById(req.params.iterationId)
    iteration.comments.push(req.body)
    await iteration.save()
    const newComment = iteration.comments[post.comments.length - 1]
    const profile = await Profile.findById(req.user.profile, 'name avatar')
    newComment.author = profile
    res.status(201).json(newComment)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

export {
  undoVote,
  castVote,
  newIteration,
  createComment,
  createIteration,
}


