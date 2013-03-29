
<!-- saved from url=(0072)https://raw.github.com/mark-rushakoff/OpenPhantomScripts/master/Rakefile -->
<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><style type="text/css"></style></head><body cz-shortcut-listen="true"><pre style="word-wrap: break-word; white-space: pre-wrap;">#!/usr/bin/env rake

require 'rubygems'
require 'bundler'
Bundler.require
require 'rspec/core/rake_task'

RSpec::Core::RakeTask.new(:spec) do |t|
  t.pattern = 'spec/*_spec.rb'
  t.verbose = true
end

def start_server
  require 'spec_helper'
  OpenPhantomHelper::start_server_once
end

task :start_server_and_run_specs do
  start_server
  Rake::Task['spec'].execute
end

task :default =&gt; :start_server_and_run_specs
</pre></body></html>