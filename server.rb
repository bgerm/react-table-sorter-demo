require 'sinatra'
require 'JSON'

set :public_folder, 'public'

get '/api/source1' do
  content_type :json

  limit = params[:limit].to_i || 10

  data = JSON.parse(File.read(File.join('public', 'json', 'source1.json')))
  data[0...limit].to_json
end

get '/api/source2' do
  content_type :json

  limit = params[:limit].to_i || 10

  data = JSON.parse(File.read(File.join('public', 'json', 'source2.json')))
  data[0...limit].to_json
end

get "/" do
  redirect '/index.html'
end
