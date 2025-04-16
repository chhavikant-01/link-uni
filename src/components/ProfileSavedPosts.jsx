import { useSelector } from "react-redux"
import { useEffect, useState, useCallback } from "react";
import LoadingCard from "./LoadingCard";
import PostCard from "./PostCard";

export default function ProfileSavedPosts() {
  const user = useSelector((state)=>state.user.currentUser);
  const [loading, setLoading] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]); 

  const fetchUserPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/saved/${user.userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await response.json();
      const posts = data.data;
      setSavedPosts(posts);
      setLoading(false);
    } catch(error) {
      setLoading(false);
      console.log(error);
    }
  }, [user.userId]);
  
  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  return (
    <section className="w-full">
    <div className="container mx-auto px-4 md:px-6">
      <div className="mb-8 md:mb-10 lg:mb-12">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">My Saved</h2>
      </div>
      {
        loading && (
          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        )
      }
      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {savedPosts && savedPosts.map((post) => (
        <PostCard
                  key={post._id}
                  _id={post._id}
                  author={post.author}
                  likes={post.likes.length || 0}
                  likedBy={post.likes || []}
                  title={post.title}
                  program={post.category.program}
                  description={post.desc}
                  course={post.category.course}
                  resourceType={post.category.resourceType}
                  uploadedAt={post.createdAt}
                />
      ) )}
      {
        savedPosts.length === 0 && (
          <div className="text-center w-full">
            <p className="text-lg text-gray-600">No saved posts</p>
          </div>
        )
      }
      </div>
    </div>
  </section>
  )
}
