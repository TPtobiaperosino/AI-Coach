



# DynamoDB:
# - table: contains the items (in rows)
# - item: record json like
# In every item there are fields --> I'll put a UUID to match each recommendation with its corresponding photo
# - Primary Key: how dynamo organises and find the items and can have:
# (i) Partition Key (PK): decide where the item finishes (sharding)
# (ii) Sort Key (SK): order items in the PK
# - Query: use PK and SK, very fast
# - Scan: read everything, slow and expensive
# - TTL (Time To Live) --> auto-delete machanism of items after a certain date based on timestamp epoch:
# timestamp epoch is like the sum of seconds since the item has bee recorded, when it exceeds expiresAt (max sum of seconds) the item is deleted
# GSI (Global Secondary Index) --> a second way to read the tableusing different keys from the primary ones
# Pay Per Request --> measures how much do I pay based on units consumed including: (i) read request units (ii) write request units (iii) storage occupied

# In my use case I'll use PK (primary key) to record the userid, and SK (secondary key) to record when it has been created
# 