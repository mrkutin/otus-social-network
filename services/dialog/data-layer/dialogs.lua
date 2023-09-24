#!lua name=otus
redis.register_function('knockknock', function()
    return 'I am here!!!'
end)

redis.register_function('echo', function(keys, args)
    return args[1] .. args[2]
end)

redis.register_function('message_create', function(keys, args)
    redis.call('JSON.SET', 'message:'..args[1], '$', args[2])
end)

redis.register_function('message_search', function(keys, args)
    return redis.call('FT.SEARCH', 'messageIdx', '@from_user_id:('..args[1]..') @to_user_id:('..args[2]..')', 'limit', '0', '1000')
end)

