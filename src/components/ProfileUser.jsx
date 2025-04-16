import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import React, { useState, useEffect } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateFailure, updateStart, updateSuccess } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const ProfileUser = () => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState(currentUser.firstname + " " + currentUser.lastname);
  const [email, setEmail] = useState(currentUser.email);
  const [program, setProgram] = useState(currentUser.program);
  const [yearOfGraduation, setYearOfGraduation] = useState(currentUser.yearOfGraduation);
  const [username, setUsername] = useState(currentUser.username);
  const [password, setPassword] = useState("");
  const [editField, setEditField] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [shareSpaceUsername, setShareSpaceUsername] = useState(currentUser.professionalProfile || "");
  const [shareSpaceProfile, setShareSpaceProfile] = useState(currentUser.professionalProfileType || "");


  const userData = [
    { label: "Name", value: name, setter: setName, backendField: "name", editable: false },
    { label: "Username", value: username, setter: setUsername, backendField: "username", editable: false },
    { label: "Email", value: email, setter: setEmail, backendField: "email", editable: false },
    { label: "Program", value: program, setter: setProgram, backendField: "program", editable: false },
    { label: "Year Of Graduation", value: yearOfGraduation, setter: setYearOfGraduation, backendField: "yearOfGraduation", editable: true },
    { label: "Password", value: password, setter: setPassword, backendField: "newPassword", type:"password", editable: true },
  ];

  const handleEditClick = (field) => {
    setEditField(field);
  };

  const handleConfirmClick = async (backendField, value) => {
    const formData = { password: currentPassword };
    formData[backendField] = value;
    setEditField(null);
    try {
      dispatch(updateStart());
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/user/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        toast.error(data.message);
      } else {
        dispatch(updateSuccess(data.data));
        toast.success("Profile updated successfully");
      }
    } catch (e) {
      dispatch(updateFailure(e.message));
      toast.error(e.message);
    }
    setCurrentPassword("");
  };

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleDelete = async()=>{
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/user/delete-user`,
    {
      method: "DELETE",
      credentials: "include",
    })
    if(!res.ok){
      return toast.error("Failed to delete user")
    }
    if(res.ok){
      navigate("/login");
      return toast.success("User deleted")
    }
  }

  const handleShareSpaceProfileChange = async(value)=>{
    setShareSpaceProfile(value);
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/user/update-share-space-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({profile: value}),
    })
    const data = await res.json();
    if (!res.ok) {
      return toast.error(data.message);
    } else {
      const newUser = {...currentUser, professionalProfileType: data.data.professionalProfileType}
      dispatch(updateSuccess(newUser))
      return toast.success("Profile updated successfully");
    }
  }

  const handleShareSpaceUsernameChange = async(value)=>{
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/user/update-share-space-username`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({username: value}),
    })
    const data = await res.json();
    if (!res.ok) {
      return toast.error(data.message);
    } else {
      const newUser = {...currentUser, professionalProfile: data.data.professionalProfile}
      dispatch(updateSuccess(newUser))
      setEditField("")
      return toast.success("Profile updated successfully");
    }
  }

  return (
    <main>
      <div className="container mx-auto grid gap-8 px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>View and manage your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
          <div className="sm:grid sm:grid-cols-[1fr_auto] items-center sm:gap-2 flex flex-col">
            <p className="text-sm font-medium mb-2 flex flex-col">
              ShareSpace Username
              <p className="text-xs text-muted-foreground mb-2 max-w-sm mt-2">
                Your ShareSpace username is used to create your profile link. Don't have an account?&nbsp;
                  <a href="https://www.sharespace.bio/sign-up" className="text-blue-600 hover:underline">
                    Click here
                  </a>
              </p>
            </p>
            <div className="sm:flex sm:flex-row items-center flex flex-col-reverse gap-2">
            {editField === "ShareSpace Username" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant=""
                        size="sm"
                        onClick={() => handleShareSpaceUsernameChange(shareSpaceUsername)}
                      >
                        Confirm Changes
                      </Button>
                      </div>
            )}
            {editField !== "ShareSpace Username" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick("ShareSpace Username")}
                      >
                        Edit
                      </Button>
                    )}
                    <div className="flex gap-2"> 

                    <Input
                      type="text"
                      value={shareSpaceUsername}
                      placeholder={"ShareSpace Username"}
                      onChange={(e)=>setShareSpaceUsername(e.target.value)}
                      className="max-w-[200px]"
                      disabled={editField !== "ShareSpace Username"}
                    />
                    <div className="space-y-2">
                      <Select id="profileType" name="profileType" onValueChange={(value)=>handleShareSpaceProfileChange(value)} value={shareSpaceProfile}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Profile" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="personal" value="personal">Personal</SelectItem>
                            <SelectItem key="professional" value="professional">Professional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    </div>
            </div>
          </div>
            {userData.map(({ label, value, setter, backendField, type = "text", editable }) => (
              <div className="sm:grid sm:grid-cols-[1fr_auto] items-center sm:gap-2 flex flex-col" key={label}>
                <p className="text-sm font-medium mb-2 flex flex-col">
                  {label}
                </p>
                <div className="sm:flex sm:flex-row items-center flex flex-col-reverse gap-2">
                  {editField === label && editable && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant=""
                        size="sm"
                        onClick={() => handleConfirmClick(backendField, value)}
                      >
                        Confirm Changes
                      </Button>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={handleChange(setCurrentPassword)}
                        placeholder="Current Password"
                        className="max-w-[200px]"
                      />
                    </div>
                  )}
                  {editField !== label && editable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(label)}
                    >
                      Edit
                    </Button>
                  )}
                  <Input
                    type={type}
                    value={value}
                    placeholder={label}
                    onChange={handleChange(setter)}
                    className="max-w-[200px]"
                    disabled={editField !== label}
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            
            <AlertDialog>
            <AlertDialogTrigger asChild>
            <Button variant="destructive" className="ml-auto">
              Delete Account
            </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our
                  servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-[#3c82f6]">Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-800" onClick={()=>handleDelete()}>Delete Account</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};

export default ProfileUser;
