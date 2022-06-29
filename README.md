## Build Your Own Repluggable
This repo is a part of a talk named "Build Your Own Repluggable" The purpose was to unveal some of the magic around wix's open source [repluggable](https://github.com/wix/repluggable) package for managing large scale front end app using micro front ends architechture. 

## How to work with this repository

There are five steps in building our own repluggable. Each step has two branches, a setup and an impl branch. start with checking out step 1`git checkout step1-setup`. run the tests `npm run test` and make them green :). If you want to see the implementation you can check out the step impl branch `git checkout step1-impl`. Follow the same pattern until step5. Goodluck.

## Step 1

* EntryPoint interface
* createAppHost
* attach implementation

## Step 2

* Host interface
* addShells implementation

## Step 3

* Precondition - setup webpack `npx webpack-cli init`

* getDependencyAPIs
* declareAPIs
* contributeApi
* getApi
* extend

## Step 4

* contributeState
* getStore

## Step 5

* react
* contributeMainView
