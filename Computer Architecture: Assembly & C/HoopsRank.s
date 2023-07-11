/* MIPS assembly language program called HoopsRank.s to rank basketball teams based on a combined metric. 
The tool will take a file as an input formatted with entries that are 4 lines long 
(basketball team name followed by 3 stats to be used to calculate a metric.) File end with word "DONE".
Program outputs list of team names and corresponding metric sorted in order of descending metrics 
and equal metrics sorted alphabetically*/
.text
.align 2

main:
    addi $sp,$sp,-4                 #create stack space
    sw $ra, 0($sp)                  #save ra to return to Qtspim

    #ask for name
    li $v0, 4
    la $a0, team
    syscall

    #create memory space
    li $v0,9
    li $a0,72
    syscall
    move $s1,$v0                #designate head

    #read and save name
    li $v0,8                    #take in input
    la $a0, 0($s1)              #load byte space into address
    li $a1, 64                  # allot the byte space for string
    syscall

    jal removenln               #remove nln 

    #ask for int
    li $v0, 4
    la $a0, avgscore
    syscall

    #read and save int
    li $v0, 5
    syscall
    move $t1, $v0               #save avg points scored

    #ask for int
    li $v0, 4
    la $a0, avglet
    syscall

    #read and save int
    li $v0, 5
    syscall
    move $t2, $v0               #save avg points given up

    #ask for int
    li $v0, 4
    la $a0, rebound
    syscall

    #read and save int
    li $v0, 5
    syscall
    move $t3, $v0               #save rebound diff

    sub $t4,$t1,$t2
    add $a1,$t4,$t3                 #metri calculated

    sw $a1, 64($s1)                 #assign metric to head
    sw $0,68($s1)                   #head->next is null


    #ask for name
    li $v0, 4
    la $a0, team
    syscall

    #create memory space
    li $v0,9
    li $a0,72
    syscall

    move $s3,$v0                #save allocated address

    #read and save name
    li $v0,8                    #take in input
    la $a0, 0($s3)              #load byte space into address
    li $a1, 64                  # allot the byte space for string
    syscall


     move $t0,$a0               #save name for later use

while:
    la $a1, done
    jal strcmp                  #compare a0 to Done
    beqz $v0,printloop          #if done, start printing

    move $a0,$s3                #pass address into argument
    jal removenln               #remove nln

    #ask for int
    li $v0, 4
    la $a0, avgscore
    syscall

    #read and save int
    li $v0, 5
    syscall
    move $t1, $v0               #save avg points scored

    #ask for int
    li $v0, 4
    la $a0, avglet
    syscall

    #read and save int
    li $v0, 5
    syscall
    move $t2, $v0               #save avg points given up

    #ask for int
    li $v0, 4
    la $a0, rebound
    syscall

    #read and save int
    li $v0, 5
    syscall
    move $t3, $v0               #save rebound diff

    move $a0,$t0                    #temp head name
    sub $t4,$t1,$t2
    add $a1,$t4,$t3                 #metric calculation
    
    #s3 still holds address
    
    jal newnode

    #ask for name
    li $v0, 4
    la $a0, team
    syscall

    #create memory space
    li $v0,9
    li $a0,72
    syscall

    move $s3,$v0                #save address of memory allocation
    
    #read and save name
    li $v0,8                    #take in input
    la $a0, 0($s3)              #load byte space into address
    li $a1, 64                  # allot the byte space for string
    syscall

    move $t0, $a0               #save name to use later

j while


printloop:
    beqz $s1, endprint          #stop when current= null

    #print name
    li $v0,4
    la $a0,0($s1)
    syscall

    #print space
    li $v0, 4
    la $a0, sp
    syscall

    #print metric
    li $v0,1
    lw $a0, 64($s1)
    syscall

    #print new line
    li $v0, 4
    la $a0, nln
    syscall

    lw $t0, 68($s1)                 #temp= current->next
    move $s1,$t0                    #current=temp
j printloop

endprint:
    lw $ra,0($sp)                   #restore ra to return to Qtspim
    addi $sp, $sp, 4                #destroy stack
jr $ra


newnode:
    #create stack frame space
    addi $sp, $sp, -20
    sw $s0,0($sp)
    sw $ra, 4($sp)
    sw $s2,8($sp)
    sw $s3, 12($sp)
    sw $s1, 16($sp)

    move $s0,$a0                    #save name
    move $s2, $a1                   #save metric

    move $t0,$s1                    #current=head

    li $t1,0                        #previous initialized to null
    lw $t3, 64($s1)                 #get metric of head
    
    beq $t3, $a1,_eqhead            #if metrics are equal break
    slt $t2,$t3, $a1                #t2 hold 1 if new metric>first metric
    beqz $t2,beforeloop             #newmetric<first metric,break to start looping

_gthead:#greater metric than head
    sw $s2, 64($s3)                 #assign metric
    sw $t0,68($s3)                   #next is old head

    move $s1,$s3                    #switch head pointer

    lw $s0,0($sp)                   #restore registers
    lw $ra, 4($sp)
    lw $s2,8($sp)
    lw $s3, 12($sp)
    addi $sp, $sp, 20
    #didnt restore s1 on purpose
    jr $ra                          #return to main

_eqhead:
    move $a0,$s0                    #move new name to a0
    la $a1,0($t0)                   #move current name to a1

    jal strcmp

    slt $t2,$v0,0                   #t2 has 1 if v0 is negative, a0 comes before, new node is new head
    bnez $t2,_gthead                #alphabetically first

    # check if next also has equal metric
    lw $t3,68($t0)
    beqz $t3,premove                #break if next is null, insert after current
    
    lw $t2,64($t3)
    bne $t2,$s2,premove             #insert after current

    la $a1,0($t3)                   #load name of next
    jal strcmp
    slt $t2,$v0,0                   #t2 has 1 if v0 is negative, a0 comes before next node
    beqz $t2,beforeloop             # loop again, new comes after next
                
    j premove                       #else new node comes right after head


beforeloop:
    move $t1,$t0                    #prev=current
    lw $t0,68($t0)                  #current=next

loop:
    beqz $t0,insert                #break when current is null

    lw $t3,64($t0)                  #load current metric
    beq $s2 ,$t3,insertEq           #break if equal metric
    
    slt $t2, $s2, $t3               #t2 hold 0 if metric>current metric
    beqz $t2,insert                 #insert before current

    #else keep going through loop
    move $t1,$t0                    #prev=current
    lw $t0,68($t0)                  #current=next

    j loop

insertEq:

    move $a0,$s0                    #move new name to a0
    la $a1,0($t0)                   # move current name to a1

    jal strcmp

    slt $t2,$v0,0                   #t2 has 1 if v0 is negative, a0 comes before current
    bnez $t2,insert                 #insert before

    # check if next also has equal metric
    lw $t3,68($t0)
    beqz $t3,premove                #break if next is null, insert after current
    
    lw $t2,64($t3)                  #load next metric
    bne $t2,$s2,premove             #if not equal, insert after current

    la $a1,0($t3)                   #load next name into a1

    jal strcmp

    slt $t2,$v0,0                   #t2 has 1 if v0 is negative, a0 comes before next
    beqz $t2,beforeloop             #if new comes after next, loop
                
    #else new node comes right after head
    j premove


premove:#adjusts pointers
    move $t1,$t0                    #prev=current
    lw $t0,68($t0)                  #current=current->next

insert:
    sw $s2, 64($s3)                 #assign metric
    la $t3, 0($s3)                  #load address to new pointer
    sw $t3,68($t1)                  #previousnext=new
    
    beqz $t0, nullpoint             #if current is null store null as new->next
    
    la $t3,0($t0)                   #load current pointer                   
    sw $t3,68($s3)                  #new->next=current

    j insertend

nullpoint:
    sw $0,68($s3)                   #newnext=null

insertend:
    lw $s0,0($sp)                   #restore s0
    lw $ra, 4($sp)                  #restore ra
    lw $s2,8($sp)                   #restore s2
    lw $s3, 12($sp)
    lw $s1, 16($sp)
    addi $sp, $sp, 20               #destroy frame
jr $ra

strcmp:
    addi $sp,$sp, -12               #create frame and store used registers
    sw $s0,0($sp)
    sw $ra, 4($sp)
    sw $s2,8($sp)

    move $s0,$a0
    move $s2, $a1
    
    strloop:
    lb      $t5, 0($s0)             # load a byte from str1
    lb      $t6, 0($s2)             # load a byte from str2

beq     $t5, $t6, bEq           # check if the bytes are equal

slt $t2,$t5,$t6                 #1 if s0 comes before s1
beqz $t2,after                 #s0 comes after s1

before:
    li $v0,-1
    j endcmp

bEq:#move pointer up one byte and re loop
    li $v0,0
    beqz $t5, endcmp
    addi $s0,$s0,1
    addi $s2,$s2,1
    j strloop

after:
    li $v0,1

endcmp:
    #restore registers and destroy frame
    lw $s0,0($sp)
    lw $ra, 4($sp)
    lw $s2,8($sp)
    addi $sp,$sp, 12
jr $ra

removenln:
    #store registers and create frame
    addi $sp,$sp, -8
    sw $s0,0($sp)
    sw $ra, 4($sp)

_loop: #loop until null byte found
    lb $s0, 0($a0)
    beqz $s0, remove
    addi $a0,$a0,1
j _loop

remove: #replace nln with 0
    addi $a0, $a0,-1
    sb $0,0($a0)

    #restore registers and destroy frame
    lw $s0, 0($sp)
    lw $ra, 4($sp)
    addi $sp,$sp, 8
jr $ra


.data
team: .asciiz "Enter team name: "
avgscore:    .asciiz "Average points scored: "
avglet: .asciiz "Average points given up: "
rebound:    .asciiz "Average rebound differential: "
sp: .asciiz " "
nln: .asciiz "\n"
done:.asciiz "DONE\n"
