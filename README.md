# twitter-bridge
[![Build Status](https://travis-ci.org/Pixep/twitter-bridge.svg?branch=master)](https://travis-ci.org/Pixep/twitter-bridge) [![Coverage Status](https://coveralls.io/repos/github/Pixep/twitter-bridge/badge.svg?branch=master)](https://coveralls.io/github/Pixep/twitter-bridge?branch=master)

A simple Node JS proxy to retrieve a Twitter timeline from a specific account, in JSON, without requiring OAuth.
Also applies some tweets formatting.

It requires the following environment variables to authenticate in Tweeter account:
- TWITTER_CONSUMER_KEY
- TWITTER_CONSUMER_SECRET
- TWITTER_ACCESS_TOKEN_KEY
- TWITTER_ACCESS_TOKEN_SECRET

They can be obtained after creating an application for your Tweeter account from https://apps.twitter.com/app/new
