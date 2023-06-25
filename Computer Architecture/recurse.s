/* MIPS assembly code program called recurse.s that computes f(N), 
where N is an integer greater than zero that is 
input to the program on the command line. 
f(N) = 2*N + f(N-1) - 1. The base case is f(0)=2.*/

.text                           # Code segment
.align 2                        # ensure data segment items align to 2^2 = 4 bytes

main:                         # MAIN procedure Entrance
addi $sp,$sp,-4
sw $ra, 0($sp)
#ask for input
li $v0, 4
la $a0, prompt
syscall

#read and save int
li $v0, 5
syscall
move $a0, $v0

jal form                        #call recursive function
#print result
move $a0,$v0
li $v0,1
syscall

lw $ra, 0($sp)
addi $sp, $sp,4
li $v0,0

jr $ra


form: 

bnez $a0,notbase                   #branch if a0 equal zero

li $v0,2                  #base case return 2
jr $ra

notbase:
addi $sp, $sp,-8
sw $ra,0($sp)

move $s0, $a0                   #copy a0 into s0

sw $s0, 4($sp)

addi $a0,$a0,-1                  #subtract 1 from a0
jal form                         #recursive call

lw $s0,4($sp)
li $t0,2                      
mult $t0,$s0                    #2*n
mflo $t1                        #store product
addi $t1,$t1,-1                  #subtract 1
add $v0,$t1,$v0                 #return 2*n-1+form(n-1)


lw $ra, 0($sp)                  #reset ra
addi $sp, $sp, 8                #reset sp
jr $ra                          #jump up one layer in recursion

.data
prompt: .asciiz "Please enter an integer: "