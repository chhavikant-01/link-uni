import { useState, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select"   
  import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "./ui/command"

  import { CSE_CORE, CSE_CSF, CSE_AIDS, CSE_CSBS, resourceTypes, fileTypes, semesters } from "../programme.js"
  import { useDispatch } from 'react-redux'
  import { setPosts, setStatus, setError } from "../redux/posts/postSlice";

  const programs = [CSE_CSF.name, CSE_CORE.name, CSE_AIDS.name, CSE_CSBS.name]
  const courses = {
    [CSE_CSF.name]: CSE_CSF.courses,
    [CSE_CORE.name]: CSE_CORE.courses,
    [CSE_AIDS.name]: CSE_AIDS.courses,
    [CSE_CSBS.name]: CSE_CSBS.courses,
  }



export default function FilterBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('desc')
  const [selectedProgram, setSelectedProgram] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedResourceType, setSelectedResourceType] = useState('')
  const [selectedFileType, setSelectedFileType] = useState('')

  const [filteredCourses, setFilteredCourses] = useState([])
  const [openCourseDialog, setOpenCourseDialog] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    if (selectedProgram && courses[selectedProgram]) {
        setSelectedCourse('')
        setFilteredCourses(courses[selectedProgram])
    } else {
      setFilteredCourses([])  // Reset when there's no valid program
    }
  }, [selectedProgram])
  


    const filterPosts = async () => {
      dispatch(setStatus('loading'))
      try{

        const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/filter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            semester: selectedSemester,
            resourceType: selectedResourceType,
            fileType: selectedFileType,
            sort: sortOption,
            keyword: searchQuery,
            course: selectedCourse,
            program: selectedProgram
          })
        })
        const data = await res.json()
        dispatch(setStatus('succeeded'))
        dispatch(setPosts(data.data))
      }catch(err){
        dispatch(setStatus('failed'))
        dispatch(setError(err.message))
      }
    }

    const handleClearFilters = async () => {
      setSearchQuery('')
      setSortOption('desc')
      setSelectedProgram('')
      setSelectedSemester('')
      setSelectedCourse('')
      setSelectedResourceType('')
      setSelectedFileType('')
     } 
     useEffect(() => {
      // Call `filterPosts` whenever any filter changes
      filterPosts()
    }, [selectedProgram, selectedSemester, selectedCourse, selectedResourceType, selectedFileType, sortOption, searchQuery])
    

  return (
    <div className="p-4 space-y-4 bg-[#020817] rounded-lg shadow">
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest</SelectItem>
            <SelectItem value="asc">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex sm:flex-wrap sm:flex-row sm:gap-2 gap-4 w-full flex-col justify-center">
  <Select value={selectedProgram} onValueChange={setSelectedProgram}>
    <SelectTrigger className="w-full sm:w-[180px]">
      <SelectValue placeholder="Select Program" />
    </SelectTrigger>
    <SelectContent>
      {programs.map((program) => (
        <SelectItem key={program} value={program}>{program}</SelectItem>
      ))}
    </SelectContent>
  </Select>


  <Button
    variant="outline"
    role="combobox"
    aria-expanded={openCourseDialog}
    className="w-full sm:w-[200px] justify-between"
    disabled={!selectedProgram}
    onClick={() => setOpenCourseDialog(true)}
  >
    {selectedCourse || "Select Course"}
    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
  </Button>

  <CommandDialog open={openCourseDialog} onOpenChange={setOpenCourseDialog}>
    <CommandInput placeholder="Type a course or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Courses">
        {filteredCourses.map((course) => (
          <CommandItem key={course.name} onSelect={() => setSelectedCourse(course.name)}>
            <span>{course.name}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  </CommandDialog>

  <Select 
    value={selectedSemester} 
    onValueChange={setSelectedSemester}
  >
    <SelectTrigger className="w-full sm:w-[180px]">
      <SelectValue placeholder="Select Semester" />
    </SelectTrigger>
    <SelectContent>
      {semesters.map((semester) => (
        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
      ))}
    </SelectContent>
  </Select>
  <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
    <SelectTrigger className="w-full sm:w-[180px]">
      <SelectValue placeholder="Resource Type" />
    </SelectTrigger>
    <SelectContent>
      {resourceTypes.map((type) => (
        <SelectItem key={type} value={type}>{type}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
<div className='flex sm:flex-wrap sm:flex-row sm:gap-2 gap-4 w-full flex-col justify-center'>
  {/* <Button
    onClick={filterPosts}
    variant="outline"
    className="bg-[#3c82f6] hover:bg-[#306fd5]"

  > 
    Apply Filters 
  </Button> */}
  <Button
    variant="outline"
    className="bg-[#1e293b] hover:bg-[#101722]"
    onClick={handleClearFilters}
  >
    Reset Filters
  </Button>
</div>

    </div>
  )
}