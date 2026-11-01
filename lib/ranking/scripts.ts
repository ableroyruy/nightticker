// Each accepted HTTP batch is acknowledged only after Redis commits it. The digest
// binds its idempotency key to its payload; a retry cannot increment counts twice.
// Rate limiting happens before new writes and duplicate retries consume no quota.
export const RECORD_BATCH_SCRIPT = `
local previous = redis.call('GET', KEYS[1])
if previous then
  if previous == ARGV[1] then return 0 else return -2 end
end
local used = tonumber(redis.call('GET', KEYS[2]) or '0')
local count = tonumber(ARGV[2])
if used + count > tonumber(ARGV[3]) then return -1 end
local events = cjson.decode(ARGV[4])
for _, event in ipairs(events) do
  redis.call('HINCRBY', KEYS[event.key], event.symbol, event.count)
end
for index = 3, #KEYS do redis.call('EXPIRE', KEYS[index], 90000) end
redis.call('SET', KEYS[1], ARGV[1], 'EX', 7200)
redis.call('INCRBY', KEYS[2], count)
redis.call('EXPIRE', KEYS[2], 60)
return 1
`;

// A slow worker must never overwrite a newer worker's snapshot after its lease expires.
export const PUBLISH_SCRIPT = `
if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[2], ARGV[2], 'EX', 90000)
if redis.call('EXISTS', KEYS[3]) == 0 then
  local ranks = cjson.decode(ARGV[3])
  local fields = {}
  for symbol, rank in pairs(ranks) do
    fields[#fields + 1] = symbol
    fields[#fields + 1] = rank
  end
  if #fields > 0 then
    redis.call('HSET', KEYS[3], unpack(fields))
    redis.call('EXPIRE', KEYS[3], 90000)
  end
end
redis.call('DEL', KEYS[1])
return 1
`;

export const RELEASE_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end
return 0
`;
