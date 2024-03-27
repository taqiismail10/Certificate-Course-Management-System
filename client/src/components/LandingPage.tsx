import React from 'react'
import Navbar from '../components/Navbar'
import Navbar_temp from './Navbar_temp'
import HeroSection from './HeroSection'
import AboutSection from './AboutSection'
import CourseList_nonAdmin from './CourseList_nonAdmin'

const Test = () => {
  return (
    <div style={{
        backgroundImage: `url('bg_4.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
    <Navbar_temp/>
    <HeroSection></HeroSection>
    <CourseList_nonAdmin/>
    <AboutSection></AboutSection>
    </div>
  )
}

export default Test