import React from 'react'
import Navbar from '../components/Navbar'
import Navbar_temp from './Navbar_temp'
import HeroSection from './HeroSection'
import AboutSection from './AboutSection'
import CourseList_nonAdmin from './CourseList_nonAdmin'
import CourseBox from './CourseBox/CourseBox'

const Test = () => {
  return (

    <div className="container-fluid flex-fill py-5" style={{
      backgroundImage: `url('bg_8(1).jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <Navbar_temp />
      <HeroSection></HeroSection>
      {/* <CourseList_nonAdmin/> */}
      <CourseBox ></CourseBox>
      <AboutSection></AboutSection>
    </div>
  )
}

export default Test