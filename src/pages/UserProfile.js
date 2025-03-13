import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import { Edit, UploadCloud, Briefcase, GraduationCap, Globe, Link as LinkIcon, X, Plus, Camera } from "lucide-react";

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    skills: [],
    experience: "",
    education: "",
    linkedin: "",
    github: "",
    portfolio: "",
    profile_picture: "",
  });

  useEffect(() => {
    if (!id) {
      console.error("No user ID found in URL");
      return;
    }

    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();

    if (error) {
      console.error("Error fetching user:", error);
      alert("Failed to fetch user data.");
    } else {
      // Convert skills string to array if needed
      const parsedUser = {
        ...data,
        skills: typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()) : (data.skills || [])
      };
      setUser(parsedUser);
      setFormData(parsedUser);
    }

    setLoading(false);
  };

  const handleEdit = () => setEditing(!editing);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Convert skills array back to string for storage
    const dataToUpdate = {
      ...formData,
      skills: Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills
    };

    const { error } = await supabase.from("users").update(dataToUpdate).eq("id", id);
    if (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } else {
      setUser(formData);
      setEditing(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const uploadProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      alert("Failed to upload profile picture.");
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user profile with new image URL
    const updatedData = { ...formData, profile_picture: publicUrl };
    const { error: updateError } = await supabase
      .from('users')
      .update(updatedData)
      .eq('id', id);

    if (updateError) {
      console.error("Error updating profile with new image:", updateError);
      alert("Failed to update profile with new image.");
    } else {
      setFormData(updatedData);
      setUser(updatedData);
    }

    setUploading(false);
  };

  if (loading) return <p className="text-center text-gray-500">Loading user profile...</p>;
  if (!user) return <p className="text-center text-red-500">User not found.</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Cover Photo */}
      <div className="h-40 bg-gray-300 relative">
        <img
          src="https://source.unsplash.com/random/1200x400?nature"
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {editing && (
          <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer">
            <UploadCloud className="h-5 w-5 text-gray-600" />
            <input type="file" className="hidden" accept="image/*" />
          </label>
        )}
      </div>

      {/* Profile Header */}
      <div className="p-6 relative">
        {/* Profile Picture */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg absolute -top-12 left-6">
          <img
            src={user.profile_picture || "https://i.pravatar.cc/100"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          {editing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer">
              <Camera className="h-6 w-6 text-white" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={uploadProfilePicture} 
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Edit Button */}
        <button
          className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
          onClick={handleEdit}
        >
          <Edit className="h-5 w-5" />
        </button>

        <div className="mt-6 ml-32">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          {editing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write your bio here..."
              className="w-full p-2 border rounded mt-2"
              rows="3"
            />
          ) : (
            <p className="mt-2 text-gray-700">{user.bio || "No bio available."}</p>
          )}
        </div>
      </div>

      {/* User Details */}
      <div className="p-6">
        {/* Skills */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(formData.skills) && formData.skills.map((skill, index) => (
              <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                {skill}
                {editing && (
                  <button 
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <div className="flex items-center">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add skill"
                  className="p-1 border rounded-l w-32"
                />
                <button 
                  onClick={handleAddSkill}
                  className="bg-blue-500 text-white p-1 rounded-r"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-blue-500" /> Experience
          </h2>
          {editing ? (
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Add your work experience"
              className="w-full p-2 border rounded"
              rows="3"
            />
          ) : (
            <p className="text-gray-700">{user.experience || "No experience details available."}</p>
          )}
        </div>

        {/* Education */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-green-500" /> Education
          </h2>
          {editing ? (
            <textarea
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder="Add your education"
              className="w-full p-2 border rounded"
              rows="3"
            />
          ) : (
            <p className="text-gray-700">{user.education || "No education details available."}</p>
          )}
        </div>

        {/* Social Links */}
        <div>
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-indigo-500" /> Social Links
          </h2>
          {editing ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-24">LinkedIn:</span>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn URL"
                  className="flex-1 p-2 border rounded"
                />
              </div>
              <div className="flex items-center">
                <span className="w-24">GitHub:</span>
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="GitHub URL"
                  className="flex-1 p-2 border rounded"
                />
              </div>
              <div className="flex items-center">
                <span className="w-24">Portfolio:</span>
                <input
                  type="text"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="Portfolio URL"
                  className="flex-1 p-2 border rounded"
                />
              </div>
            </div>
          ) : (
            <ul className="text-blue-600">
              {user.linkedin && (
                <li className="mb-1">
                  <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-800">
                    <LinkIcon className="h-4 w-4 mr-2" /> LinkedIn
                  </a>
                </li>
              )}
              {user.github && (
                <li className="mb-1">
                  <a href={user.github} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-800">
                    <LinkIcon className="h-4 w-4 mr-2" /> GitHub
                  </a>
                </li>
              )}
              {user.portfolio && (
                <li>
                  <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-800">
                    <LinkIcon className="h-4 w-4 mr-2" /> Portfolio
                  </a>
                </li>
              )}
              {!user.linkedin && !user.github && !user.portfolio && (
                <li className="text-gray-500">No social links added yet.</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Save Button */}
      {editing && (
        <div className="p-6 border-t flex justify-end">
          <button 
            onClick={() => setEditing(false)} 
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;