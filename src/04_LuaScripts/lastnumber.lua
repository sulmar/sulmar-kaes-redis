local keyname = 'bill:lastnumber'
local lastnumber = redis.call('GET', keyname)
lastnumber = lastnumber + 1
redis.call('SET', keyname, lastnumber)
return lastnumber