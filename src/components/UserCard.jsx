import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Button } from "./ui/button"
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { updateStart, updateSuccess, updateFailure } from "../redux/user/userSlice"
import { updatePosts } from "../redux/posts/postSlice"
import { useState } from "react"

export default function UserCard(props) {
  const dispatch = useDispatch()  
  const currentUser = useSelector((state)=> state.user.currentUser);
  const currentPosts = useSelector((state)=> state.posts.posts);
  const shareSpaceUsername = props.user?.professionalProfile
  const shareSpaceProfileType = props.user?.professionalProfileType

  const handleFollow = async() =>{
        try{
          dispatch(updateStart());
          const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/user/${props.user.userId}/follow`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          const data = await response.json();
          if(!response.ok){
            toast(data.message, {icon: "😫"})
          }
          if(response.ok){
            const updatedUser = {...currentUser, followings: [...currentUser.followings, props.user.userId]}
            const updatedPosts = updatePostUserFollowers(1);
            dispatch(updatePosts(updatedPosts));
            dispatch(updateSuccess(updatedUser));
            toast(data.message, {icon: "👏"})
          }
        }catch(err){
            dispatch(updateFailure(err.message));
            toast(err.message, {icon: "😿"})
        }
  }

  const handleUnfollow = async() =>{
      try{
        dispatch(updateStart());
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/user/${props.user.userId}/unfollow`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        if(!response.ok){
            toast(data.message, {icon: "😫"});}
        if(response.ok){
          const updatedUser = {...currentUser, followings: currentUser.followings.filter(id => id !== props.user.userId)}
          const updatedPosts = updatePostUserFollowers(-1);
          dispatch(updatePosts(updatedPosts));
          dispatch(updateSuccess(updatedUser));
          toast(data.message, {icon: "🥺"})
        }
  }catch(err){
      dispatch(updateFailure(err.message));
      toast(err.message, {icon: "😿"})
  }       
}
  const updatePostUserFollowers = (offset) => {
    const updatedPosts = currentPosts.map(post => {
      if (post.author.userId === props.user.userId) {
        const updatedAuthor = {
          ...post.author,
          numberOfFollowers: post.author.numberOfFollowers + offset
        };
        return {
          ...post,
          author: updatedAuthor
        };
      }
      return post;
    });
    return updatedPosts;
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
      <Avatar className="cursor-pointer">
            <AvatarImage src={props.user?.profilePicture || "./default_pfp.svg"} className="object-cover" />
          <AvatarFallback></AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col items-center justify-center space-y-4 p-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-xl font-bold">{props.user?.name}</div>
            <div className="text-sm text-muted-foreground">{props.user?.program}</div>
            {
              shareSpaceUsername &&
              <a href={`https://sharespace.bio/${shareSpaceUsername}/${shareSpaceProfileType}`} target="_blank" className="text-sm font-bold hover:underline text-blue-600">Visit Profile</a>
            }
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xl font-bold">{props.user?.yearOfGraduation}</div>
              <div className="text-sm text-muted-foreground">Graduation</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold">{props.user?.numberOfPosts}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold">{props.user?.numberOfFollowers}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
          </div>
          {!currentUser?.followings?.includes(props.user?.userId) && <Button variant="" onClick={handleFollow} className="w-full">
            Follow
          </Button>}
          {currentUser?.followings?.includes(props.user?.userId) && <Button variant="outline" onClick={handleUnfollow} className="w-full">
            Unollow
          </Button>}
          
        </div>
      </PopoverContent>
    </Popover>
  )
}