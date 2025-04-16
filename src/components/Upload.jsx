import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import {useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { addPost } from "../redux/posts/postSlice";
import { updateStart, updateSuccess, updateFailure } from "../redux/user/userSlice";
import { CSE_AIDS, CSE_CSF, CSE_CORE,CSE_CSBS, semesters, resourceTypes } from "../programme";
import { ChevronDown } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { useEffect } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the Quill CSS

const programs = [CSE_AIDS.name, CSE_CORE.name, CSE_CSF.name]
const courses = {
  [CSE_AIDS.name]: CSE_AIDS.courses,
  [CSE_CORE.name]: CSE_CORE.courses,
  [CSE_CSF.name]: CSE_CSF.courses,
  [CSE_CSBS.name]: CSE_CSBS.courses,
}


export default function Upload() {

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState(null);
  const fileInputRef = useRef(null);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [resourceType, setResourceType] = useState("");
  const [formValues, setFormValues] = useState({
    title: "",
    desc: "",
    fileType: "",
    fileName: "",
    fileUrl: "",
    category: {
      program: "",
      semester: "",
      course: "",
      resourceType: "",
    }
  });
  const dispatch = useDispatch();
  const currentUser = useSelector((state)=>state.user.currentUser);

  useEffect(() => {
    if (selectedProgram && courses[selectedProgram]) {
        setSelectedCourse('')
        setFilteredCourses(courses[selectedProgram])
    } else {
      setFilteredCourses([])  // Reset when there's no valid program
    }
  }, [selectedProgram])


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if required fields are filled
    if (!formValues.title || !formValues.desc || !formValues.category.program || !formValues.category.course) {
      return toast.error("Please fill out all the fields");
    }

  
    dispatch(updateStart());
  
    // Use toast.promise to show the status of the file upload
    toast.promise(
      (async () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", formValues.title);
        formData.append("desc", formValues.desc);
        formData.append("program", formValues.category.program);
        formData.append("course", formValues.category.course);
        formData.append("resourceType", formValues.category.resourceType);
  
        const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          dispatch(updateFailure(data.message));
          throw new Error(data.message); // This will trigger the error toast
        }
  
        let newPost = data.data;
        newPost.author = {
          _id: currentUser.userId,
          username: currentUser.username,
          name: `${currentUser.firstname} ${currentUser.lastname}`,
          profilePicture: currentUser.profilePicture,
          program: currentUser.program,
          yearOfGraduation: currentUser.yearOfGraduation,
          numberOfPosts: currentUser.posts.length,
          numberOfFollowers: currentUser.followers.length,
        };
  
        let updatedUser = { ...currentUser, posts: [...currentUser.posts, newPost._id] };
        dispatch(updateSuccess(updatedUser));
        dispatch(addPost(newPost));
  
        // Clear the form after successful upload
        setFormValues({
          title: "",
          desc: "",
          fileType: "",
          fileName: "",
          fileUrl: "",
          category: {
            program: "",
            semester: "",
            course: "",
            resourceType: "",
          }
        });
        setTitle("");  
        setDesc("");   
        setSelectedProgram(""); 
        setSelectedCourse(""); 
        setFile(null);
        setUploadProgress(0);

  
        return data.message; // Return success message to show success toast
      })(),
      {
        loading: 'Uploading file...',
        success: 'File uploaded successfully!',
        error: 'Failed to upload file',
      }
    );
  };
  
  

  const handleRemoveFile = () => {
    if (uploadTask) {
      uploadTask.cancel();
      toast.error("File Removed");
    }
    setFile(null);
    setUploadProgress(0);
  };
  
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (!selectedFile) toast.error("Please select a file to upload");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      category: {
        ...prevValues.category,
        [name]: value,
      },
    }));
  };

  const handleCourseChange = (course) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      category: {
        ...prevValues.category,
        course: course,
      },
    }));
  }
  const handleProgramChange = (program) => {
    setSelectedProgram(program); // Update selected program
    setFormValues((prevValues) => ({
      ...prevValues,
      category: {
        ...prevValues.category,
        program: program,
      },
    }));
  };

  const handleTitleChange = (newTitle) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      title: newTitle, 
    }));
  }

  useEffect(() => {
    formValues.desc = desc;
  }, [desc]);

  const handleClearForm = () => {

    setFormValues({
      title: "",
      desc: "",
      fileType: "",
      fileName: "",
      fileUrl: "",
      category: {
        program: "",
        semester: "",
        course: "",
        resourceType: "",
      }
    });
    

    setTitle("");  
    setDesc("");   
    setSelectedProgram(""); 
    setSelectedCourse(""); 
    setFile(null);
    setUploadProgress(0);
  }

  return (
    <Dialog defaultClose>
      <DialogTrigger asChild>
        <Button>
          <UploadIcon className="h-5 w-5 mr-2" />
          Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[75vh] overflow-y-auto overflow-x-hidden rounded-md">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
          <DialogDescription>Fill out the form to add a new resource to the system.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
            
          <div className="flex flex-col gap-4 mb-10">
            <div className="space-y-2">
              <Input id="title" placeholder="Enter post title" value={title} onChange={(e) => {
                const newTitle = e.target.value;
                setTitle(newTitle);
                handleTitleChange(newTitle);
              }} />
            </div>
            <div className="space-y-2">
            <Select
              value={selectedProgram}
              onValueChange={(program) => handleProgramChange(program)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
              { currentUser && currentUser.program &&
                <SelectItem value={currentUser.program}>
                  {currentUser.program}
                </SelectItem>
              }
                

              </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
              <Select id="semester" name="semester" onValueChange={(value)=>handleChange({target:{name:'semester', value}})} value={formValues.category.semester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester"  />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester, index) => (
                    <SelectItem key={index} value={`${semester}`} className="text-center">{semester}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
            <Button
              variant="outline"
              role="combobox"
              type="button"
              aria-expanded={openCourseDialog}
              className="w-full sm:w-[200px] justify-between"
              disabled={!selectedProgram}
              onClick={() => setOpenCourseDialog(true)}
            >
              <span className="truncate max-w-[150px]">{selectedCourse || "Select Course"}</span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>

            <CommandDialog open={openCourseDialog} onOpenChange={setOpenCourseDialog}>
              <CommandInput placeholder="Type a course or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Courses">
                  {filteredCourses.map((course) => (
                    <CommandItem key={course.name} onSelect={
                      () => {
                        setSelectedCourse(course.name);
                        handleCourseChange(course.name);
                        setOpenCourseDialog(false);
                      }
                    }>
                      <span>{course.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </CommandDialog>

            </div>
            <div className="space-y-2">
              <Select id="resourceType" name="resourceType" onValueChange={(value)=>handleChange({target:{name:'resourceType', value}})} value={formValues.category.resourceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((resourceType) => (
                    <SelectItem key={resourceType} value={resourceType}>{resourceType}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 ">
              <Label htmlFor="description">Description</Label>
              <ReactQuill
                      value={desc}
                      onChange={(value)=>{
                        setDesc(value);
                      }}
                      modules={{
                        toolbar: [
                          [{ 'header': '1' }, { 'header': '2' }],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                          [{ 'align': [] }],
                          ['link'],
                          ['clean']
                        ],
                      }}
                      formats={[
                        'header', 'list', 'bold', 'italic', 'underline', 'strike',
                        'blockquote', 'align', 'link'
                      ]}
                      placeholder="Write your description here..."
                      className="h-full"
                    />
            </div>
          </div>
          <div className="space-y-2 mt-20">
            <div className="grid gap-2">
              {file ? (
                <div className="flex items-center justify-between border rounded-md p-4">
                  <div className="flex items-center gap-2">
                    <FileIcon className="w-6 h-6 text-muted-foreground" />
                    <p>{file.name}</p>
                  </div>
                  <Button variant="ghost" onClick={handleRemoveFile}>
                    <XIcon className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center border-2 border-dashed border-muted rounded-md p-4 transition-colors hover:border-primary cursor-pointer">
                  <div className="text-center w-full">
                    <Input id="file" type="file" className="sr-only" onChange={handleFileUpload} ref={fileInputRef} />
                    <label htmlFor="file" className="flex flex-col items-center gap-2">
                      <UploadIcon className="w-6 h-6 text-muted-foreground" />
                      <p className="text-muted-foreground">Drag and drop files here or click to upload</p>
                    </label>
                  </div>
                </div>
              )}
              {isUploading && (
                <div className="w-full bg-muted rounded-md overflow-hidden">
                  <div className="bg-primary h-2 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          </div>
          <Button type="submit">Confirm</Button>
        </form>
          <Button variant="outline" onClick={handleClearForm}>
            Clear All
          </Button>
      </DialogContent>
    </Dialog>
  );
}
function FileIcon(props) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function UploadIcon(props) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function XIcon(props) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
