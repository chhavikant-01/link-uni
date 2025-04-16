import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import Lottie from 'lottie-react'
import animationData from "../components/onboarding.json"
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { updateSuccess } from '../redux/user/userSlice'
import { CSE_AIDS, CSE_CORE, CSE_CSF, CSE_CSBS} from "../programme.js"
import { signoutSuccess } from '../redux/user/userSlice'

export default function OnboardingPage() {
  const [program, setProgram] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const programOptions = [CSE_CSF.name, CSE_CORE.name, CSE_AIDS.name, CSE_CSBS.name];

  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({length: 5}, (_, i) => currentYear + i)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (!program || !graduationYear) {
      return toast.error('Please fill out all fields')
    }
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/user/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ program, graduationYear, username })
    })
    const data = await res.json()
    if (res.ok) {
      setLoading(false)
      dispatch(updateSuccess(data.data))
    } else {
      setLoading(false)
      return toast.error('An error occurred. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/user/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      await response.json();
      if (response.ok) {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
        <Button onClick={handleLogout} variant='ghost' className='w-ful justify-start gap-2 text-sm font-medium bg-muted hover:bg-slate-700'>
          Go Back
        </Button>
          <div>
            <h2 className="mt-6 text-3xl font-extrabold">Welcome to LinkUni</h2>
            <p className="mt-2 text-sm text-gray-400">
              Let's get you set up with your account
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <Label htmlFor="program" className="text-sm font-medium text-gray-300">
                  Select Your Program
                </Label>
                <Select value={program} onValueChange={setProgram} required>
                  <SelectTrigger id="program" className="w-full bg-gray-600 border-gray-700">
                    <SelectValue placeholder="Choose a program" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-600 border-gray-700">
                  {
                    programOptions.map((programOption) => (
                      <SelectItem key={programOption} value={programOption}>
                        {programOption}
                      </SelectItem>
                    ))
                  }
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="graduationYear" className="text-sm font-medium text-gray-300">
                  Year of Graduation
                </Label>
                <Select value={graduationYear} onValueChange={setGraduationYear} required>
                  <SelectTrigger id="graduationYear" className="w-full bg-gray-600 border-gray-700">
                    <SelectValue placeholder="Select graduation year" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-600 border-gray-700">
                    {graduationYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="username" className="text-sm font-medium text-gray-300">
                  <h1>ShareSpace Username (Optional)</h1>
                  <p className="text-xs text-muted-foreground mb-2 max-w-sm mt-2">
                Your ShareSpace username is used to create your profile link. Don't have an account?&nbsp;
                  <a href="https://www.sharespace.bio/sign-up" className="text-blue-600 hover:underline">
                    Click here
                  </a>
              </p>
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-600 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Button disabled={loading} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Get Started <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="flex justify-center items-center h-full w-full bg-gray-900">
          <Lottie
            animationData={animationData}
            className="flex justify-center items-center h-1/2"
            loop={true}
          />
        </div>
      </div>
    </div>
  )
}

