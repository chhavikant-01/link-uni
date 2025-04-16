import React, { useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'
import { Button } from './ui/button'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateFailure, updateStart, updateSuccess } from '../redux/user/userSlice'
import { Link } from 'react-router-dom'
import UserCard from './UserCard'
import { deletePost, updatePostLikes } from '../redux/posts/postSlice'
import { Star, ClockIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import {  Trash2 } from "lucide-react"
import ShareButton from './ShareButton'

const HomeCard = (props) => {
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [numberOfLikes, setNumberOfLikes] = useState(props.likes)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser && currentUser.savedPosts.includes(props._id.toString())) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
    if (currentUser && props.likedBy.includes(currentUser.userId)) {
      setIsLiked(true);
    }else{
      setIsLiked(false);
    }
  }, [currentUser, props._id, props.likedBy]);

  let formattedDate = 'Invalid date';
  try {
    formattedDate = formatDistanceToNow(new Date(props.uploadedAt), { addSuffix: true });
  } catch (e) {
    console.error('Invalid date value:', props.uploadedAt);
  }

  const handleSave = async () => {
    try {
      if (!currentUser) {
        return toast.error('Please login to save this post');
      }

      dispatch(updateStart());
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/${props._id}/save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        return toast.error(data.message);
      }

      const updatedUser = { ...currentUser, savedPosts: data.data.savedPosts };

      dispatch(updateSuccess(updatedUser));
      setIsSaved(!isSaved);
      return toast.success(data.message);
    } catch (err) {
      dispatch(updateFailure(err.message));
      return toast.error(err.message);
    }
  }

  const handleLike = async () => {
    try {
      if(!currentUser){
        return toast.error('Please login to like this post');
      }
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/${props._id}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await res.json();
      if(!res.ok){
        return toast.error('Failed to like post');
      }
      if(res.ok){
        setIsLiked(!isLiked);
        if(data.data === 1){
          dispatch(updatePostLikes({postId: props._id, userId: currentUser.userId, offset: 1}));
          setNumberOfLikes(prevLikes => prevLikes + 1);
          return toast(data.message, {icon: '🥳'});
        }
        if(data.data === -1){
          dispatch(updatePostLikes({postId: props._id, userId: currentUser.userId, offset: -1}));
          setNumberOfLikes(prevLikes => prevLikes - 1);
          return toast(data.message, {icon: '🥹' });
        }
      }
    }catch(e){
      return toast.error(e.message);
    }
  }

  const handleDeletePost = async () => {
    try{
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/${props._id}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
    const data = await res.json()
    if(!res.ok){
      setIsAlertDialogOpen(false)
      return toast.error(data.message)
    }
    if(res.ok){
      const restPosts = currentUser.posts.filter(post => post !== props._id)
      const updatedUser = {...currentUser, posts: restPosts}
      dispatch(updateSuccess(updatedUser))
      dispatch(deletePost(props._id))
      setIsAlertDialogOpen(false)

      return toast.success(data.message)
    }
    }catch(err){
      return toast.error('Something went wrong, try again later!')
    }
  }

  const handleDeleteClick = () => {
    setIsAlertDialogOpen(true);
  };

  const handleCloseAlertDialog = () => {
    setIsAlertDialogOpen(false);
  };

  return (
    <div className="rounded-lg shadow-md p-6 border-2">
      <div className="flex justify-between mb-4">
      <div className='flex items-start gap-2'>

      <UserCard user={props.author} />
        <div className="flex-grow">
          {props.author.name ? 
            <h3 className="font-semibold text-lg">{props.author.name.split(' ')[0]}</h3>
          :
            <h3 className="font-semibold text-lg">User</h3>
          }
          <p className="text-sm text-muted-foreground">{props.author.program}</p>
        </div>
      </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <ClockIcon className="w-4 h-4 mr-1" />
          <span>{formattedDate}</span>
        </div>
      </div>
      <Link to={`/dossier?id=${props._id}`} className='hover:text-[#3c82f6]'>
      <h2 className="text-2xl font-bold mb-4">{props.title}</h2>
      <div className="flex flex-wrap gap-2 px-4 py-2">
      <div
        className={`min-h-6 rounded-full px-2 py-0 text-xs font-medium bg-[#0f2727] text-[#01e6c4] border-2 cursor-default`
        }
      >
        {props.category}
      </div>
      <div
        className={`min-h-6 rounded-full px-2 py-0 text-xs font-medium bg-[#1e1e40] text-[#c2b8ff] border-2 cursor-default`
        }
      >
        {props.course}
      </div>
    </div>
    </Link>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={handleLike} className='flex items-center gap-1'>
            <Star className={isLiked ? "h-5 w-5 fill-current text-[#e2b340]" : "h-5 w-5"} />
            <span>{numberOfLikes}</span>
        </Button>
        <Button variant="ghost" onClick={handleSave} className=''>
            <BookmarkIcon className={isSaved ? "h-5 w-5 fill-current text-blue-500" : "h-5 w-5"} />
        </Button>
        <ShareButton url={`${window.location.origin}/dossier?id=${props._id}`} />
        <Button variant="ghost" size="icon" className="text-red-600" onClick={handleDeleteClick}>
            <Trash2 className="h-5 w-5" />  
        </Button>
  
        {isAlertDialogOpen && (
          <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your post from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCloseAlertDialog}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePost}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}

export default HomeCard

function BookmarkIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  )
}

