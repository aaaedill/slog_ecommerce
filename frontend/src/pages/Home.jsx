
import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import Newsletter from './Newsletter'
import SlogStandard from '../components/SlogStandard'

const Home = () => {

  return (

    <div className="w-full">
      <Hero />
      <LatestCollection />
      <Newsletter />
      <SlogStandard />
    </div>
  )
}

export default Home
