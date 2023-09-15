#!lua name=otus
redis.register_function('knockknock', function()
    return 'I am here!!!'
end)

redis.register_function('echo', function(keys, args)
    return args[1]
end)