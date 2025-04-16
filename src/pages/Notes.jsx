import { useSelector } from "react-redux"
import FilterBar from "../components/FilterBar"
import LoadingCard from "../components/LoadingCard"
import PostCard from "../components/PostCard"

export default function Notes() {
  
  const currentPosts = useSelector((state) => state.posts.posts);
  const status = useSelector((state) => state.posts.status);
  const currentUser = useSelector((state) => state.user.currentUser);
  let filteredPosts;

  if(currentPosts.length > 0 ){
    filteredPosts = currentPosts.filter(post => 
      !currentUser.blacklistedPosts?.includes(post._id)
    );
  }
  
  

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
        <FilterBar />
        <div className="flex flex-col gap-6">
        {
          status === 'loading' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </div>
          ):(
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts && filteredPosts.map((post) => (
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
                  uploadedAt={post.createdAt} />
              ))}
          </div>
          )
        }{
          currentPosts.length === 0 && status !== 'loading' && (
            <div className="flex items-center justify-center h-[50vh]">
              <p className="text-muted-foreground">No posts found</p>
            </div>
          )
        }
          {/* <div className="flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div> */}
        </div>

    </div>
  )
}